// @flow
//
//  Copyright (c) 2019-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

import { lib_filename, lib_es6_dts } from "./lib";
import { ros_lib_filename, ros_lib_dts } from "./ros";
import userUtilities from "webviz-core/src/players/UserNodePlayer/nodeTransformerWorker/typescript/userUtils";

export type NodeProjectFile = {
  fileName: string,
  filePath: string,
  sourceCode: string,
};

export type NodeProjectConfig = {
  defaultLibFileName: string,
  declarations: NodeProjectFile[],
  utilityFiles: NodeProjectFile[],
};

const utilityFiles: NodeProjectFile[] = userUtilities.map((utility) => ({
  ...utility,
  filePath: `/utils/${utility.fileName}`,
}));

export function getNodeProjectConfig() {
  // TODO load these from .ts files rather than string consts
  const declarations = [];
  declarations.push({
    fileName: lib_filename,
    filePath: lib_filename,
    sourceCode: lib_es6_dts,
  });
  declarations.push({
    fileName: ros_lib_filename,
    filePath: `/node_modules/${ros_lib_filename}`,
    sourceCode: ros_lib_dts,
  });

  return {
    defaultLibFileName: lib_filename,
    declarations,
    utilityFiles,
  };
}
