<template>
  <el-card class="operate-container" shadow="never">
      <div class="search">
      <div class="search-left-header">
          <el-icon><Tickets/></el-icon>
          <span>数据列表</span>
      </div>
      <div class="search-right-header">
          <!-- <el-button
          class="btn-add"
          @click="handleAddProduct()"
          size="small">
          添加
          </el-button> -->
      </div>
      </div>
  </el-card>
  <el-card>
    <div class="table-container">
      <el-table ref="selectSessionTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="秒杀时间段名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="每日开始时间" align="center">
          <template #default="scope">{{ formatTime(scope.row.startTime)}}</template>
        </el-table-column>
        <el-table-column label="每日结束时间" align="center">
          <template #default="scope">{{formatTime(scope.row.endTime)}}</template>
        </el-table-column>
        <el-table-column label="商品数量" align="center">
          <template #default="scope">{{scope.row.productCount}}</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button size="small"
                       type="text"
                       @click="handleShowRelation(scope.$index, scope.row)">商品列表
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
    
</template>
<script>
  import {fetchSelectList} from '@/api/flashSession';
  import { defineComponent, onMounted, reactive, toRefs } from 'vue'
  import {formatDate} from '@/utils/date';
  import {useRoute, useRouter} from 'vue-router'
  import {Tickets} from '@element-plus/icons-vue'
  export default defineComponent({
    components: {Tickets},
    setup(){
      const states = reactive({
        list: null,
        listLoading: false
      })
      const route = useRoute();
      const router = useRouter();

      const methods = reactive({
        handleShowRelation(index,row){
          router.push({path:'/sms/flashProductRelation',query:{
            flashPromotionId:route.query.flashPromotionId, flashPromotionSessionId:row.id}})
        },
        getList() {
          states.listLoading = true;
          fetchSelectList({flashPromotionId: route.query.flashPromotionId}).then(response => {
            states.listLoading = false;
            states.list = response.data;
          });
        },
        formatTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'hh:mm:ss')
      }
      })
      onMounted(()=> {
        methods.getList();
      })

      return {
        ...toRefs(states),
        ...toRefs(methods)
      }
  
    }
    
      
  })
</script>
<style scoped>
</style>


