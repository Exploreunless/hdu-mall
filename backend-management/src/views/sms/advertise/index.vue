<template>
  <!-- 搜索框 -->
  <el-card class="filter-container" shadow="never">
    <div class="search">
      <div class="search-left-header">
        <el-icon><search /></el-icon>
        <span>筛选搜索</span>
      </div>
      <div class="search-right-header">
        <el-button
          @click="handleSearchList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
        <el-button
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      
    </div>
    <div class="search-form">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="广告名称：">
          <el-input v-model="listQuery.name" class="input-width" placeholder="广告名称"></el-input>
        </el-form-item>
        <el-form-item label="广告位置：">
          <el-select v-model="listQuery.type" placeholder="全部" clearable class="input-width">
            <el-option v-for="item in typeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间：">
          <el-date-picker
            class="input-width"
            v-model="listQuery.endTime"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="请选择时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
  <!-- 数据框 -->
  <el-card class="operate-container" shadow="never">
    <div class="search">
      <div class="search-left-header">
        <el-icon><Tickets/></el-icon>
        <span>数据列表</span>
      </div>
      <div class="search-right-header">
        <el-button
          class="btn-add"
          @click="handleAdd()"
          size="small">
          添加广告
        </el-button>
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="homeAdvertiseTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="120" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="广告名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="广告位置" width="120" align="center">
          <template #default="scope">{{formatType(scope.row.type )}}</template>
        </el-table-column>
        <el-table-column label="广告图片" width="120" align="center">
          <template #default="scope"><img style="height: 80px" :src="scope.row.pic"></template>
        </el-table-column>
        <el-table-column label="时间" width="220" align="center">
          <template #default="scope">
            <p>开始时间：{{formatTime(scope.row.startTime)}}</p>
            <p>到期时间：{{formatTime(scope.row.endTime )}}</p>
          </template>
        </el-table-column>
        <el-table-column label="上线/下线" width="120" align="center">
          <template #default="scope">
            <el-switch
              @change="handleUpdateStatus(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="点击次数" width="120" align="center">
          <template #default="scope">{{scope.row.clickCount}}</template>
        </el-table-column>
        <el-table-column label="生成订单" width="120" align="center">
          <template #default="scope">{{scope.row.orderCount}}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button size="small"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button size="small"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 批量 -->
      <div class="batch-operate-container">
        <el-select
          size="small"
          v-model="operateType" placeholder="批量操作">
          <el-option
            v-for="item in operates"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button
          style="margin-left: 20px"
          class="search-button"
          @click="handleBatchOperate()"
          type="primary"
          size="small">
          确定
        </el-button>
      </div>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="listQuery.pageNum"
          v-model:page-size="listQuery.pageSize"
          :page-sizes="[5, 10, 15]"
          small
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {fetchList,updateStatus,deleteHomeAdvertise} from '@/api/homeAdvertise';
import {formatDate} from '@/utils/date';
import {useRouter} from 'vue-router'
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 5,
      name: null,
      type: null,
      endTime:null
    };
    const defaultTypeOptions = [
      {
        label: 'PC首页轮播',
        value: 0
      },
      {
        label: 'APP首页轮播',
        value: 1
      }
    ];

    const router = useRouter()
    const states = reactive({
      listQuery: Object.assign({}, defaultListQuery),
      typeOptions: Object.assign({}, defaultTypeOptions),
      list: null,
      total: null,
      listLoading: false,
      multipleSelection: [],
      operates: [
        {
          label: "删除",
          value: 0
        }
      ],
      operateType: null
    })

    const methods = reactive({

      handleResetSearch() {
        states.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        states.listQuery.pageNum = 1;
        methods.getList();
      },
      handleSizeChange(val){
        states.listQuery.pageNum = 1;
        states.listQuery.pageSize = val;
        methods.getList();
      },
      handleCurrentChange(val){
        states.listQuery.pageNum = val;
        methods.getList();
      },
      handleSelectionChange(val){
        states.multipleSelection = val;
      },
      getList(){
        states.listLoading=true;
        fetchList(states.listQuery).then(response => {
          states.listLoading = false;
          states.list = response.data.list;
          states.total = response.data.total;
        });
      },

      handleRecommendStatusStatusChange(index,row){
        methods.updateRecommendStatusStatus(row.id,row.recommendStatus);
      },

      handleBatchOperate(){
        if (states.multipleSelection < 1) {
          ElMessage({
            message: '请选择一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let ids = [];
        for (let i = 0; i < states.multipleSelection.length; i++) {
          ids.push(states.multipleSelection[i].id);
        }
        if(states.operateType===0){
          //删除
          methods.deleteHomeAdvertise(ids);
        }else {
          ElMessage({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1000
          });
          return;
        }
      },
      
      handleUpdateStatus(index,row){
        ElMessageBox.confirm('是否要修改上线/下线状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id,{status:row.status}).then(()=>{
            methods.getList();
            ElMessage({
              type: 'success',
              message: '修改成功!'
            });
          });
        }).catch(() => {
          ElMessage({
            type: 'success',
            message: '已取消操作!'
          });
          methods.getList();
        });
      },
      // 删除
      handleDelete(index, row) {
        methods.deleteHomeAdvertise(row.id);
      },

      handleAdd(){
        router.push({path: '/sms/addAdvertise'})
      },
      handleUpdate(index,row){
        router.push({path: '/sms/updateAdvertise', query: {id: row.id}})
      },

      deleteHomeAdvertise(ids){
        ElMessageBox.confirm('是否要删除该广告?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params=new URLSearchParams();
          params.append("ids",ids);
          deleteHomeAdvertise(params).then(()=>{
            methods.getList();
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
          });
        })
      },
      
      // 过滤器
      formatType(type){
        if(type===1){
          return 'APP首页轮播';
        }else{
          return 'PC首页轮播';
        }
      },
      formatTime(time){
        if(time==null||time===''){
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },

    })
    // let list = reactive([])
    onMounted(()=>{
      methods.getList()
    })

    return {
      ...toRefs(methods),
      ...toRefs(states)
    }
  },
})
</script>

<style lang="less" scoped>
 .search-form{
      margin-top: 15px;
      .el-form{
        @formWidth: 192px;
        .el-input{
          width: @formWidth;
        }
        .el-select{
          width: @formWidth;
        }
          
      }
    }
</style>
