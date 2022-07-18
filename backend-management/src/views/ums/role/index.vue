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
          <el-input v-model="listQuery.keyword" class="input-width" placeholder="角色名称" clearable></el-input>
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
          添加
        </el-button>
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="roleTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="角色名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="描述" align="center">
          <template #default="scope">{{scope.row.description}}</template>
        </el-table-column>
        <el-table-column label="用户数"  width="100" align="center">
          <template #default="scope">{{scope.row.adminCount}}</template>
        </el-table-column>
        <el-table-column label="添加时间" width="160" align="center">
          <template #default="scope">{{ formatDateTime(scope.row.createTime)}}</template>
        </el-table-column>
        <el-table-column label="是否启用" width="140" align="center">
          <template #default="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" >
          <template #default="scope">
            <el-row style="justify-content: center;">
              <el-button size="small"
                         type="text"
                         @click="handleSelectMenu(scope.$index, scope.row)">分配菜单
              </el-button>
              <el-button size="small"
                         type="text"
                         @click="handleSelectResource(scope.$index, scope.row)">分配资源
              </el-button>
            </el-row>
            <el-row style="justify-content: center;">
            <el-button size="small"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="small"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
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
  <!-- 添加用户或编辑用户的对话框 -->
  <el-dialog
      :title="isEdit?'编辑角色':'添加角色'"
      v-model="dialogVisible"
      width="40%">
      <el-form :model="role"
               ref="roleForm"
               label-width="150px" >
        <el-form-item label="角色名称：">
          <el-input v-model="role.name" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input v-model="role.description"
                    type="textarea"
                    :rows="5"
                    style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="role.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
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
import {fetchList,createRole,updateRole,updateStatus,deleteRole} from '@/api/role';
import {useRouter} from 'vue-router'
import {formatDate} from '@/utils/date';
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const router = useRouter();
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 5,
      keyword: null
    };
    const defaultRole = {
      id: null,
      name: null,
      description: null,
      adminCount: 0,
      status: 1
    };
    const states = reactive({
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: false,
      dialogVisible: false,
      role: Object.assign({}, defaultRole),
      isEdit: false
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
      
      getList(){
        states.listLoading=true;
        fetchList(states.listQuery).then(response => {
          states.listLoading = false;
          states.list = response.data.list;
          states.total = response.data.total;
        });
      },

      handleStatusChange(index, row) {
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
      // 删除
      handleDelete(index, row) {
        ElMessageBox.confirm('是否要删除该角色?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteRole(row.id).then(() => {
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
            methods.getList();
          });
        });
      },

      handleAdd(){
        states.dialogVisible=true;
        states.isEdit = false;
        states.role = Object.assign({},defaultRole);
      },

      handleUpdate(index, row){
        states.dialogVisible=true;
        states.isEdit = true;
        states.role = Object.assign({},row);
      },
      handleDialogConfirm() {
        ElMessageBox.confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (states.isEdit) {
            updateRole(states.role.id,states.role).then(() => {
              ElMessage({
                message: '修改成功！',
                type: 'success'
              });
              states.dialogVisible =false;
              methods.getList();
            })
          } else {
            createRole(states.role).then(() => {
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
      handleSelectMenu(index,row){
        router.push({path:'/ums/allocMenu',query:{roleId:row.id}})
      },
      handleSelectResource(index,row){
        router.push({path:'/ums/allocResource',query:{roleId:row.id}})
      },
      
      // 过滤器
     formatDateTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      }
    })
    // let list = reactive([])
    onMounted(()=>{
      methods.getList();
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
