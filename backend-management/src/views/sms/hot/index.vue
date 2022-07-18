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
        <el-form-item label="商品名称：">
        <el-input v-model="listQuery.productName" class="input-width" placeholder="商品名称"></el-input>
        </el-form-item>
        <el-form-item label="推荐状态：">
        <el-select v-model="listQuery.recommendStatus" placeholder="全部" clearable class="input-width">
            <el-option v-for="item in recommendOptions"
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
          @click="handleSelectProduct()"
          size="small">
          选择商品
        </el-button>
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="newProductTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="120" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="scope">{{scope.row.productName}}</template>
        </el-table-column>
        <el-table-column label="是否推荐" width="200" align="center">
          <template #default="scope">
            <el-switch
              @change="handleRecommendStatusStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.recommendStatus">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="160" align="center">
          <template #default="scope">{{scope.row.sort}}</template>
        </el-table-column>
        <el-table-column label="状态" width="160" align="center">
          <template #default="scope">{{formatRecommendStatus(scope.row.recommendStatus)}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small"
                       type="text"
                       @click="handleEditSort(scope.$index, scope.row)">设置排序
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
  <!-- 添加活动的对话框 -->
  <el-dialog title="选择商品" v-model="selectDialogVisible" width="40%">
    <el-input v-model="dialogData.listQuery.keyword"
              style="width: 250px;margin-bottom: 20px"
              placeholder="商品名称搜索">
    <template #append> 
      <el-button  @click="handleSelectSearch()"><el-icon><Search/></el-icon></el-button>
    </template>
    </el-input>
    <el-table :data="dialogData.list"
              @selection-change="handleDialogSelectionChange" border>
      <el-table-column type="selection" width="60" align="center"></el-table-column>
      <el-table-column label="商品名称" align="center">
        <template #default="scope">{{scope.row.name}}</template>
      </el-table-column>
      <el-table-column label="货号" width="160" align="center">
        <template #default="scope">NO.{{scope.row.productSn}}</template>
    </el-table-column>
    <el-table-column label="价格" width="120" align="center">
        <template #default="scope">￥{{scope.row.price}}</template>
    </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleDialogSizeChange"
        @current-change="handleDialogCurrentChange"
        layout="prev, pager, next"
        v-model:current-page="dialogData.listQuery.pageNum"
        :page-size="dialogData.listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :total="dialogData.total">
      </el-pagination>
    </div>
    <div style="clear: both;"></div>
    <template #footer>
      <span>
        <el-button  size="small" @click="selectDialogVisible = false">取 消</el-button>
        <el-button  size="small" type="primary" @click="handleSelectDialogConfirm()">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog title="设置排序"
              v-model="sortDialogVisible"
              width="40%">
    <el-form :model="sortDialogData"
              label-width="150px">
      <el-form-item label="排序：">
        <el-input v-model="sortDialogData.sort" style="width: 200px"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span >
        <el-button @click="sortDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleUpdateSort" size="small">确 定</el-button>
      </span>
    </template>
    
  </el-dialog>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {fetchList,updateRecommendStatus,deleteHotProduct,createHotProduct,updateHotProductSort} from '@/api/hotProduct';
import {fetchList as fetchProductList} from '@/api/product';
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 5,
      productName: null,
      recommendStatus: null
    };
    const defaultRecommendOptions = [
      {
        label: '未推荐',
        value: 0
      },
      {
        label: '推荐中',
        value: 1
      }
    ];
    const states = reactive({
      listQuery: Object.assign({}, defaultListQuery),
      recommendOptions: Object.assign({}, defaultRecommendOptions),
      list: null,
      total: null,
      listLoading: false,
      multipleSelection: [],
      operates: [
        {
          label: "设为推荐",
          value: 0
        },
        {
          label: "取消推荐",
          value: 1
        },
        {
          label: "删除",
          value: 2
        }
      ],
      operateType: null,
      selectDialogVisible:false,
      dialogData:{
        list: null,
        total: null,
        multipleSelection:[],
        listQuery:{
          keyword: null,
          pageNum: 1,
          pageSize: 5
        }
      },
      sortDialogVisible:false,
      sortDialogData:{sort:0,id:null}
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
        if (states.operateType === 0) {
          //设为推荐
          methods.updateRecommendStatusStatus(ids,1);
        } else if (states.operateType === 1) {
          //取消推荐
          methods.updateRecommendStatusStatus(ids,0);
        } else if(states.operateType===2){
          //删除
          methods.deleteProduct(ids);
        }else {
          ElMessage({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1000
          });
          return;
        }
      },
      
      // 删除
      handleDelete(index, row) {
        methods.deleteProduct(row.id);
      },

      handleSelectProduct(){
        states.selectDialogVisible=true;
        methods.getDialogList();
      },
      getDialogList(){
        fetchProductList(states.dialogData.listQuery).then(response=>{
          states.dialogData.list=response.data.list;
          states.dialogData.total=response.data.total;
        })
      },
      handleSelectSearch(){
        methods.getDialogList();
      },
      handleDialogSizeChange(val) {
        states.dialogData.listQuery.pageNum = 1;
        states.dialogData.listQuery.pageSize = val;
        methods.getDialogList();
      },
      handleDialogCurrentChange(val) {
        states.dialogData.listQuery.pageNum = val;
        methods.getDialogList();
      },
      handleDialogSelectionChange(val){
        states.dialogData.multipleSelection = val;
      },
      handleSelectDialogConfirm(){
        if (states.dialogData.multipleSelection < 1) {
          ElMessage({
            message: '请选择一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let selectProducts = [];
        for (let i = 0; i < states.dialogData.multipleSelection.length; i++) {
          selectProducts.push({
            productId:states.dialogData.multipleSelection[i].id,
            productName:states.dialogData.multipleSelection[i].name
          });
        }
        ElMessageBox.confirm('使用要进行添加操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          createHotProduct(selectProducts).then(()=>{
            states.selectDialogVisible=false;
            states.dialogData.multipleSelection=[];
            methods.getList();
            ElMessage({
              type: 'success',
              message: '添加成功!'
            });
          });
        });
      },

      handleEditSort(index,row){
        states.sortDialogVisible=true;
        states.sortDialogData.sort=row.sort;
        states.sortDialogData.id=row.id;
      },
      handleUpdateSort(){
        ElMessageBox.confirm('是否要修改排序?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateHotProductSort(states.sortDialogData).then(()=>{
            states.sortDialogVisible=false;
            methods.getList();
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
          });
        })
      },
      updateRecommendStatusStatus(ids,status){
        ElMessageBox.confirm('是否要修改推荐状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params=new URLSearchParams();
          params.append("ids",ids);
          params.append("recommendStatus",status);
          updateRecommendStatus(params).then(()=>{
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
      deleteProduct(ids){
        ElMessageBox.confirm('是否要删除该推荐?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params=new URLSearchParams();
          params.append("ids",ids);
          deleteHotProduct(params).then(()=>{
            methods.getList();
            ElMessage({
              type: 'success',
              message: '删成功!'
            });
          });
        })
      },
      // 过滤器
      formatRecommendStatus(status){
        if(status===1){
          return '推荐中';
        }else{
          return '未推荐';
        }
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
