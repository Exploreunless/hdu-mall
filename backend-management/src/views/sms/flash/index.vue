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
          <el-form-item label="活动名称：">
            <el-input v-model="listQuery.keyword" class="input-width" placeholder="活动名称" clearable></el-input>
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
          添加活动
        </el-button>
        <el-button
          class="btn-add"
          @click="handleShowSessionList()"
          size="small">
          秒杀时间段列表
        </el-button>
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="flashTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="活动标题" align="center">
          <template #default="scope">{{scope.row.title}}</template>
        </el-table-column>
        <el-table-column label="活动状态" width="140" align="center">
          <template #default="scope">{{formatActiveStatus(scope.row)}}</template>
        </el-table-column>
        <el-table-column label="开始时间" width="140" align="center">
          <template #default="scope">{{formatDate(scope.row.startDate)}}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="140" align="center">
          <template #default="scope">{{formatDate(scope.row.endDate )}}</template>
        </el-table-column>
        <el-table-column label="上线/下线" width="200" align="center">
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
                       @click="handleSelectSession(scope.$index, scope.row)">设置商品
            </el-button>
            <el-button size="small"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="small"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
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
  <!-- 添加活动的对话框 -->
  <el-dialog
      title="添加活动"
      v-model="dialogVisible"
      width="40%">
      <el-form :model="flashPromotion"
               ref="flashPromotionForm"
               label-width="150px" >
        <el-form-item label="活动标题：">
          <el-input v-model="flashPromotion.title" style="width: 220px"></el-input>
        </el-form-item>
        <el-form-item label="开始时间：">
          <el-date-picker
            v-model="flashPromotion.startDate"
            type="date"
            placeholder="请选择时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间：">
          <el-date-picker
            v-model="flashPromotion.endDate"
            type="date"
            placeholder="请选择时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上线/下线：">
          <el-radio-group v-model="flashPromotion.status">
            <el-radio :label="1">上线</el-radio>
            <el-radio :label="0">下线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
        </span>
      </template>
    </el-dialog>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {useRouter} from 'vue-router'
import {formatDate} from '@/utils/date';
import {fetchList, updateStatus, deleteFlash, createFlash, updateFlash} from '@/api/flash';
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 5,
      keyword: null
    };
    const defaultFlashPromotion = {
      id: null,
      title: null,
      startDate: null,
      endDate: null,
      status: 0
    };
    const router = useRouter();
    const states = reactive({
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: false,
      dialogVisible: false,
      flashPromotion: Object.assign({}, defaultFlashPromotion),
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
      // 状态更新
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
        ElMessageBox.confirm('是否要删除该活动?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFlash(row.id).then(() => {
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
            methods.getList();
          });
        });
      },
      // 添加活动
      handleAdd() {
        states.dialogVisible = true;
        states.isEdit = false;
        states.flashPromotion = Object.assign({},defaultFlashPromotion);
      },
      // 编辑活动
      handleUpdate(index, row) {
        states.dialogVisible = true;
        states.isEdit = true;
        states.flashPromotion = Object.assign({},row);
      },
      // 确定更新或者添加
      handleDialogConfirm() {
        ElMessageBox.confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (states.isEdit) {
            updateFlash(states.flashPromotion.id,states.flashPromotion).then(() => {
              ElMessage({
                message: '修改成功！',
                type: 'success'
              });
              states.dialogVisible =false;
              methods.getList();
            })
          } else {
            createFlash(states.flashPromotion).then(() => {
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
      handleShowSessionList() {
        router.push({path: '/sms/flashSession'})
      },

      handleSelectSession(i, row){
        router.push({path:'/sms/selectSession',query:{flashPromotionId:row.id}})
      },
      // 过滤器
      formatDate(time) {
        if(time==null||time===''){
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatActiveStatus(row) {
        let nowTime = new Date().getTime();
        let startTime = new Date(row.startDate).getTime();
        let endTime = new Date(row.endDate).getTime();
        if (nowTime >= startTime && nowTime <= endTime) {
          return '活动进行中';
        } else if (nowTime > endTime) {
          return '活动已结束';
        } else {
          return '活动未开始';
        }
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
