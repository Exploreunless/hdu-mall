<template>
  <el-card class="operate-container" shadow="never">
    <div class="search">
        <div class="search-left-header">
            <slot name="left-head"></slot>
        </div>
        <div class="search-right-header">
            <slot name="right-head"></slot>
        </div>
    </div>
  </el-card>
</template>
