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
        <el-form-item label="资源名称：">
            <el-input v-model="listQuery.nameKeyword" class="input-width" placeholder="资源名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="资源路径：">
            <el-input v-model="listQuery.urlKeyword" class="input-width" placeholder="资源路径" clearable></el-input>
        </el-form-item>
        <el-form-item label="资源分类：">
            <el-select v-model="listQuery.categoryId" placeholder="全部" clearable class="input-width">
            <el-option v-for="item in categoryOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
            </el-option>
            </el-select>
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
        <el-button size="small" class="btn-add" @click="handleShowCategory()">资源分类</el-button>
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="resourceTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="资源名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="资源路径" align="center">
          <template #default="scope">{{scope.row.url}}</template>
        </el-table-column>
        <el-table-column label="描述" align="center">
          <template #default="scope">{{scope.row.description}}</template>
        </el-table-column>
        <el-table-column label="添加时间" width="160" align="center">
          <template #default="scope">{{formatDateTime(scope.row.createTime)}}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="scope">
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
  <!-- 添加用户或编辑用户的对话框 -->
  <el-dialog
    :title="isEdit?'编辑资源':'添加资源'"
    v-model="dialogVisible"
    width="40%">
    <el-form :model="resource"
              ref="resourceForm"
              label-width="150px" >
      <el-form-item label="资源名称：">
        <el-input v-model="resource.name" style="width: 250px"></el-input>
      </el-form-item>
      <el-form-item label="资源路径：">
        <el-input v-model="resource.url" style="width: 250px"></el-input>
      </el-form-item>
      <el-form-item label="资源分类：">
        <el-select v-model="resource.categoryId" placeholder="全部" clearable style="width: 250px">
          <el-option v-for="item in categoryOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述：">
        <el-input v-model="resource.description"
                  type="textarea"
                  :rows="5"
                  style="width: 250px"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="allocDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {fetchList,createResource,updateResource,deleteResource} from '@/api/resource';
import {listAllCate} from '@/api/resourceCategory';
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
      pageSize: 10,
      nameKeyword: null,
      urlKeyword: null,
      categoryId:null
    };
    const defaultResource = {
      id: null,
      name: null,
      url: null,
      categoryId: null,
      description:''
    };
    const states = reactive({
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: false,
      dialogVisible: false,
      resource: Object.assign({}, defaultResource),
      isEdit: false,
      categoryOptions:[],
      defaultCategoryId:null
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
      // 删除
      handleDelete(index, row) {
        ElMessageBox.confirm('是否要删除该资源?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteResource(row.id).then(() => {
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
        states.resource = Object.assign({},defaultResource);
        states.resource.categoryId = states.defaultCategoryId;
      },

      handleUpdate(index, row){
        states.dialogVisible=true;
        states.isEdit = true;
        states.resource = Object.assign({},row);
      },
      handleDialogConfirm() {
        ElMessageBox.confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (states.isEdit) {
            updateResource(states.resource.id,states.resource).then(() => {
              ElMessage({
                message: '修改成功！',
                type: 'success'
              });
              states.dialogVisible =false;
              methods.getList();
            })
          } else {
            createResource(states.resource).then(() => {
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

      handleShowCategory(){
        router.push({path: '/ums/resourceCategory'})
      },

      getCateList(){
        listAllCate().then(response=>{
          let cateList = response.data;
          for(let i=0;i<cateList.length;i++){
            let cate = cateList[i];
            states.categoryOptions.push({label:cate.name,value:cate.id});
          }
          states.defaultCategoryId=cateList[0].id;
        })
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
      methods.getCateList();
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
