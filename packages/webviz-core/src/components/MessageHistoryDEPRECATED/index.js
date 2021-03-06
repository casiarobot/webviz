// @flow
//
//  Copyright (c) 2018-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

import React, { type Node, useMemo } from "react";
import type { Time } from "rosbag";

import parseRosPath, { getTopicsFromPaths } from "webviz-core/src/components/MessagePathSyntax/parseRosPath";
import {
  type MessagePathDataItem,
  useCachedGetMessagePathDataItems,
} from "webviz-core/src/components/MessagePathSyntax/useCachedGetMessagePathDataItems";
import * as PanelAPI from "webviz-core/src/PanelAPI";
import type { Message } from "webviz-core/src/players/types";
import { useShallowMemo } from "webviz-core/src/util/hooks";

export type MessageHistoryItem = {
  queriedData: MessagePathDataItem[],
  message: Message,
};

export type MessageHistoryItemsByPath = { [string]: MessageHistoryItem[] };

export type MessageHistoryData = {|
  itemsByPath: MessageHistoryItemsByPath,
  startTime: Time,
|};

type Props = {|
  children: (MessageHistoryData) => Node,
  paths: string[],
  historySize?: number,
|};

const ZERO_TIME = Object.freeze({ sec: 0, nsec: 0 });

// DEPRECATED in favor of PanelAPI.useMessagesByTopic and useCachedGetMessagePathDataItems.
//
// Be sure to pass in a new render function when you want to force a rerender.
// So you probably don't want to do `<MessageHistoryDEPRECATED>{this._renderSomething}</MessageHistoryDEPRECATED>`.
// This might be a bit counterintuitive but we do this since performance matters here.
export default React.memo<Props>(function MessageHistoryDEPRECATED({ children, paths, historySize }: Props) {
  const { startTime } = PanelAPI.useDataSourceInfo();
  const memoizedPaths: string[] = useShallowMemo<string[]>(paths);
  const subscribeTopics = useMemo(() => getTopicsFromPaths(memoizedPaths), [memoizedPaths]);

  const messagesByTopic = PanelAPI.useMessagesByTopic({
    topics: subscribeTopics,
    historySize: historySize || Infinity,
  });

  const cachedGetMessagePathDataItems = useCachedGetMessagePathDataItems(paths);

  const itemsByPath = useMemo(
    () => {
      const obj = {};
      // Create an array for each path, not just valid paths.
      for (const path of memoizedPaths) {
        obj[path] = [];
        const rosPath = parseRosPath(path);
        if (!rosPath) {
          continue;
        }

        for (const message of messagesByTopic[rosPath.topicName]) {
          // Add the item (if it exists) to the array.
          const queriedData = cachedGetMessagePathDataItems(path, message);
          if (queriedData) {
            obj[path].push({ message, queriedData });
          }
        }
      }
      return obj;
    },
    [memoizedPaths, messagesByTopic, cachedGetMessagePathDataItems]
  );

  return useMemo(() => children({ itemsByPath, startTime: startTime || ZERO_TIME }), [
    children,
    itemsByPath,
    startTime,
  ]);
});
