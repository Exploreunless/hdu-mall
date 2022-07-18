<template>
  <!-- 数据框 -->
  <el-card class="operate-container" shadow="never">
    <div class="search">
      <div class="search-left-header">
        <el-icon><Tickets/></el-icon>
        <span>发货列表</span>
      </div>
      <div class="search-right-header">
        <el-button
          class="btn-add"
          @click="handleAdd()"
          size="small">
          添加
        </el-button>
      </div>
    </div>
  </el-card>
  <el-card>
    <div class="table-container">
      <el-table ref="returnReasonTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="80" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="原因类型" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="scope">{{scope.row.sort }}</template>
        </el-table-column>
        <el-table-column label="是否可用" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              @change="handleStatusChange(scope.$index,scope.row)"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="添加时间" width="180" align="center">
          <template #default="scope">{{ formatCreateTime(scope.row.createTime)}}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="small"
              @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
  </el-card>
  <el-dialog
      title="添加退货原因"
      v-model="dialogVisible" width="30%">
      <el-form :model="returnReason"
               ref="reasonForm" label-width="150px">
        <el-form-item label="原因类型：">
          <el-input v-model="returnReason.name" class="input-width"></el-input>
        </el-form-item>
        <el-form-item label="排序：">
          <el-input v-model="returnReason.sort" class="input-width"></el-input>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-switch v-model="returnReason.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {fetchList,deleteReason,updateStatus,addReason,getReasonDetail,updateReason} from '@/api/returnReason';
import {Tickets} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {formatDate} from '@/utils/date'
export default defineComponent({
  components: {Tickets},
  setup() {
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 5
    };
    const defaultReturnReason = {
      name:null,
      sort:0,
      status:1,
      createTime:null
    };
    const states = reactive({
      list: null,
        total: null,
        multipleSelection: [],
        listLoading:true,
        listQuery:Object.assign({}, defaultListQuery),
        operateType:null,
        operateOptions: [
          {
            label: "删除",
            value: 1
          }
        ],
        dialogVisible:false,
        returnReason:Object.assign({},defaultReturnReason),
        operateReasonId:null
    })

    const methods = reactive({
      handleAdd() {
        states.dialogVisible=true;
        states.operateReasonId=null;
        states.returnReason=Object.assign({},defaultReturnReason);
      },
      handleConfirm(){
        if(states.operateReasonId==null){
          //添加操作
          addReason(states.returnReason).then(()=>{
            states.dialogVisible=false;
            states.operateReasonId=null;
            ElMessage({
              message: '添加成功！',
              type: 'success',
              duration:1000
            });
            methods.getList();
          });
        }else{
          //编辑操作
          updateReason(states.operateReasonId,states.returnReason).then(()=>{
            states.dialogVisible=false;
            states.operateReasonId=null;
            ElMessage({
              message: '修改成功！',
              type: 'success',
              duration:1000
            });
            methods.getList();
          });
        }
      },
      handleUpdate(index, row){
        states.dialogVisible=true;
        states.operateReasonId=row.id;
        getReasonDetail(row.id).then(response=>{
          states.returnReason=response.data;
        });
      },
      handleDelete(index, row){
        let ids=[];
        ids.push(row.id);
        methods.deleteReason(ids);
      },
      handleSelectionChange(val){
        states.multipleSelection = val;
      },
      handleStatusChange(index,row){
        let ids=[];
        ids.push(row.id);
        let param = new URLSearchParams();
        param.append("status",row.status);
        param.append("ids",ids);
        updateStatus(param).then(()=>{
          ElMessage({
            message: '状态修改成功',
            type: 'success'
          });
        });
      },
      handleBatchOperate(){
        if(states.multipleSelection==null||states.multipleSelection.length<1){
          ElMessage({
            message: '请选择要操作的条目',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if(states.operateType===1){
          let ids=[];
          for(let i=0;i<states.multipleSelection.length;i++){
            ids.push(states.multipleSelection[i].id);
          }
          methods.deleteReason(ids);
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
        states.listLoading = true;
        fetchList(states.listQuery).then(response => {
         
          states.listLoading = false;
          states.list = response.data.list;
          states.total = response.data.total;
        });
      },
      deleteReason(ids){
        ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = new URLSearchParams();
          params.append("ids",ids);
          deleteReason(params).then(()=>{
            ElMessage({
              message: '删除成功！',
              type: 'success',
              duration: 1000
            });
            states.listQuery.pageNum=1;
            methods.getList();
          });
        })
      },
      formatCreateTime(time) {
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
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
