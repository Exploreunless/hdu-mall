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
          <el-form-item label="输入搜索：">
            <el-input v-model="listQuery.id" class="input-width" placeholder="服务单号"></el-input>
          </el-form-item>
          <el-form-item label="处理状态：">
            <el-select v-model="listQuery.status" placeholder="全部" clearable class="input-width">
              <el-option v-for="item in statusOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="申请时间：">
            <el-date-picker
              class="input-width"
              v-model="listQuery.createTime"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="请选择时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="操作人员：">
            <el-input v-model="listQuery.handleMan" class="input-width" placeholder="全部"></el-input>
          </el-form-item>
          <el-form-item label="处理时间：">
            <el-date-picker
              class="input-width"
              v-model="listQuery.handleTime"
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
        <!-- <el-button
          class="btn-add"
          @click="handleAddProduct()"
          size="small">
          添加
        </el-button> -->
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="returnApplyTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="服务单号" width="180" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="申请时间" width="180" align="center">
          <template #default="scope">{{formatTime(scope.row.createTime)}}</template>
        </el-table-column>
        <el-table-column label="用户账号" align="center">
          <template #default="scope">{{scope.row.memberUsername}}</template>
        </el-table-column>
        <el-table-column label="退款金额" width="180" align="center">
          <template #default="scope">￥{{formatReturnAmount(scope.row)}}</template>
        </el-table-column>
        <el-table-column label="申请状态" width="180" align="center">
          <template #default="scope">{{formatStatus(scope.row.status)}}</template>
        </el-table-column>
        <el-table-column label="处理时间" width="180" align="center">
          <template #default="scope">{{formatTime(scope.row.handleTime)}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button
            size="small"
            @click="handleViewDetail(scope.$index, scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 批量操作 -->
      <div class="batch-operate-container">
        <el-select
          size="small"
          v-model="operateType" placeholder="批量操作">
          <el-option
            v-for="item in operateOptions"
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
import {useRouter} from 'vue-router'
import {formatDate} from '@/utils/date';
import {fetchList,deleteApply} from '@/api/returnApply';
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 10,
      id: null,
      receiverKeyword: null,
      status: null,
      createTime: null,
      handleMan: null,
      handleTime: null
    };
    const defaultStatusOptions=[
      {
        label: '待处理',
        value: 0
      },
      {
        label: '退货中',
        value: 1
      },
      {
        label: '已完成',
        value: 2
      },
      {
        label: '已拒绝',
        value: 3
      }
    ];
    const router = useRouter();
    const states = reactive({
      listQuery:Object.assign({},defaultListQuery),
      statusOptions: Object.assign({},defaultStatusOptions),
      list:null,
      total:null,
      listLoading:false,
      multipleSelection:[],
      operateType:1,
      operateOptions: [
      {
          label: "批量删除",
          value: 1
        }
      ],
    })

    const methods = reactive({

      handleSelectionChange(val){
        states.multipleSelection = val;
      },
      handleResetSearch() {
        states.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        states.listQuery.pageNum = 1;
        methods.getList();
      },
      handleViewDetail(index,row){
        router.push({path:'/oms/returnApplyDetail',query:{id:row.id}})
      },
      handleBatchOperate(){
        if(states.multipleSelection==null||states.multipleSelection.length<1){
          ElMessage({
            message: '请选择要操作的申请',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if(states.operateType===1){
          //批量删除
          ElMessageBox.confirm('是否要进行删除操作?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let params = new URLSearchParams();
            let ids=[];
            for(let i=0;i<states.multipleSelection.length;i++){
              ids.push(states.multipleSelection[i].id);
            }
            params.append("ids",ids);
            deleteApply(params).then(()=>{
              methods.getList();
              ElMessage({
                type: 'success',
                message: '删除成功!'
              });
            });
          })
        }
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
      getList(){
        states.listLoading=true;
        fetchList(states.listQuery).then(response => {
          states.listLoading = false;
          states.list = response.data.list;
          states.total = response.data.total;
        });
      },
      // 过滤器
      formatTime(time) {
        if(time==null||time===''){
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatStatus(status){
        for(let i=0;i<defaultStatusOptions.length;i++){
          if(status===defaultStatusOptions[i].value){
            return defaultStatusOptions[i].label;
          }
        }
      },
      formatReturnAmount(row){
        return row.productRealPrice*row.productCount;
      }
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
