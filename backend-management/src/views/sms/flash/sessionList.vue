<template>
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
          添加
        </el-button>
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="flashSessionTable"
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
          <template #default="scope">{{formatTime(scope.row.startTime )}}</template>
        </el-table-column>
        <el-table-column label="每日结束时间" align="center">
          <template #default="scope">{{formatTime(scope.row.endTime)}}</template>
        </el-table-column>
        <el-table-column label="启用" align="center">
          <template #default="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
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
    </div>
  </el-card>
  <el-dialog
      title="添加时间段"
      v-model="dialogVisible"
      width="40%">
      <el-form :model="flashSession"
               ref="flashSessionForm"
               label-width="150px" size="small">
        <el-form-item label="秒杀时间段名称：">
          <el-input v-model="flashSession.name" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="每日开始时间：">
          <el-time-picker
            v-model="flashSession.startTime"
            placeholder="请选择时间">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="每日结束时间：">
          <el-time-picker
            v-model="flashSession.endTime"
            placeholder="请选择时间">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="flashSession.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">不启用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span  class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
        </span>
      </template>
      
    </el-dialog>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {formatDate} from '@/utils/date';
  import {fetchList,updateStatus,deleteSession,createSession,updateSession} from '@/api/flashSession';
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const defaultFlashSession={
      name:null,
      startTime:null,
      endTime:null,
      status:0
    };

    const states = reactive({
      list: null,
      listLoading: false,
      dialogVisible:false,
      isEdit:false,
      flashSession:Object.assign({},defaultFlashSession)
    })

    const methods = reactive({
      handleAdd() {
        states.dialogVisible = true;
        states.isEdit = false;
        states.flashSession = Object.assign({},defaultFlashSession);
      },
      handleStatusChange(index,row){
        ElMessageBox.confirm('是否要修改该状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, {status: row.status}).then(() => {
            ElMessage({
              type: 'success',
              message: '修改成功!'
            });
          });
        }).catch(() => {
          ElMessage({
            type: 'info',
            message: '取消修改'
          });
          methods.getList();
        });
      },
      handleUpdate(index,row){
        states.dialogVisible = true;
        states.isEdit = true;
        states.flashSession = Object.assign({},row);
        states.flashSession.startTime=new Date(row.startTime);
        states.flashSession.endTime=new Date(row.endTime);
      },
      handleDelete(index,row){
        ElMessageBox.confirm('是否要删除该时间段?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteSession(row.id).then(() => {
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
            methods.getList();
          });
        });
      },
      handleDialogConfirm() {
        ElMessageBox.confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (states.isEdit) {
            updateSession(states.flashSession.id,states.flashSession).then(() => {
              ElMessage({
                message: '修改成功！',
                type: 'success'
              });
              states.dialogVisible =false;
              methods.getList();
            })
          } else {
            createSession(states.flashSession).then(() => {
              ElMessage({
                message: '添加成功！',
                type: 'success'
              });
              states.dialogVisible =false;
              methods.getList();
            })
          }
        })
      },
      
      getList(){
        states.listLoading=true;
        fetchList({}).then(response => {
          states.listLoading = false;
          states.list = response.data;
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
