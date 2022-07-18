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
      <el-table ref="productRelationTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="scope">{{scope.row.product.name}}</template>
        </el-table-column>
        <el-table-column label="货号" width="140" align="center">
          <template #default="scope">NO.{{scope.row.product.productSn}}</template>
        </el-table-column>
        <el-table-column label="商品价格" width="100" align="center">
          <template #default="scope">￥{{scope.row.product.price}}</template>
        </el-table-column>
        <el-table-column label="剩余数量" width="100" align="center">
          <template #default="scope">{{scope.row.product.stock}}</template>
        </el-table-column>
        <el-table-column label="秒杀价格" width="100" align="center">
          <template #default="scope">
            <p v-if="scope.row.flashPromotionPrice!==null" style="margin:0">￥ {{scope.row.flashPromotionPrice}}</p>
          </template>
        </el-table-column>
        <el-table-column label="秒杀数量" width="100" align="center">
          <template #default="scope">{{scope.row.flashPromotionCount}}</template>
        </el-table-column>
        <el-table-column label="限购数量" width="100" align="center">
          <template #default="scope">{{scope.row.flashPromotionLimit}}</template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="scope">{{scope.row.sort}}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
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
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="listQuery.pageNum"
          v-model:page-size="listQuery.pageSize"
          :page-sizes="[5, 10, 15]"
          small
          background
          layout="total, sizes, prev, pager, next, jumper"
          v-model:total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-card>
  <!-- 添加商品 -->
   <el-dialog title="选择商品" v-model="selectDialogVisible" width="50%">
    <el-input v-model="dialogData.listQuery.keyword"
              style="width: 250px;margin-bottom: 20px"
              placeholder="商品名称搜索">
              <template #append>
                <el-button @click="handleSelectSearch()"><el-icon><Search/></el-icon></el-button>
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
        small
        @size-change="handleDialogSizeChange"
        @current-change="handleDialogCurrentChange"
        layout="prev, pager, next"
        v-model:currentPage="dialogData.listQuery.pageNum"
        v-model:page-size="dialogData.listQuery.pageSize"
        :page-sizes="[5,10,15]"
        v-model:total="dialogData.total">
      </el-pagination>
    </div>
    <div style="clear: both;"></div>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="selectDialogVisible = false" size="small">取 消</el-button>
      <el-button type="primary" @click="handleSelectDialogConfirm()" size="small">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog title="编辑秒杀商品信息"
    v-model="editDialogVisible"
    width="40%">
    <el-form :model="flashProductRelation"
              ref="flashProductRelationForm"
              label-width="150px" >
      <el-form-item label="商品名称：">
        <span>{{flashProductRelation.product.name}}</span>
      </el-form-item>
      <el-form-item label="货号：">
        <span>NO.{{flashProductRelation.product.productSn}}</span>
      </el-form-item>
      <el-form-item label="商品价格：">
        <span>￥{{flashProductRelation.product.price}}</span>
      </el-form-item>
      <el-form-item label="秒杀价格：">
        <el-input v-model="flashProductRelation.flashPromotionPrice" class="input-width">
          <template #prefix>
            <span>￥</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="剩余数量：">
        <span>{{flashProductRelation.product.stock}}</span>
      </el-form-item>
      <el-form-item label="秒杀数量：">
        <el-input v-model="flashProductRelation.flashPromotionCount" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="限购数量：">
        <el-input v-model="flashProductRelation.flashPromotionLimit" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="排序：">
        <el-input v-model="flashProductRelation.sort" class="input-width"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="editDialogVisible = false" size="small">取 消</el-button>
      <el-button type="primary" @click="handleEditDialogConfirm()" size="small">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {useRoute} from 'vue-router'
import {fetchList,createFlashProductRelation,deleteFlashProductRelation,updateFlashProductRelation} from '@/api/flashProductRelation';
import {fetchList as fetchProductList} from '@/api/product';
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 5,
      flashPromotionId: null,
      flashPromotionSessionId: null
    };
    const route = useRoute();
    const states = reactive({
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: false,
      dialogVisible: false,
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
      editDialogVisible:false,
      flashProductRelation:{
        product:{}
      }
    })

    const methods = reactive({
      // 分页变化
      handleSizeChange(val){
        states.listQuery.pageNum = 1;
        states.listQuery.pageSize = val;
        methods.getList();
      },
      handleCurrentChange(val){
        states.listQuery.pageNum = val;
        methods.getList();
      },
      // 添加商品
      handleAdd(){
        states.selectDialogVisible=true;
        methods.getDialogList();
      },
      // 编辑
      handleUpdate(index,row){
        states.editDialogVisible = true;
        states.flashProductRelation = Object.assign({},row);
      },
      // 删除
      handleDelete(index,row){
        ElMessageBox.confirm('是否要删除该商品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFlashProductRelation(row.id).then(() => {
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
            methods.getList();
          });
        });
      },
      // 编辑确定
      handleEditDialogConfirm(){
        ElMessageBox.confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            updateFlashProductRelation(states.flashProductRelation.id,states.flashProductRelation).then(() => {
              ElMessage({
                message: '修改成功！',
                type: 'success'
              });
              states.editDialogVisible =false;
              methods.getList();
            })
        })
      },
      getList(){
        states.listLoading=true;
        fetchList(states.listQuery).then(response => {
          states.listLoading = false;
          states.list = response.data.list;
          states.total = response.data.total;
        });
      },
      // 分页
      handleDialogSizeChange(val) {
        states.dialogData.listQuery.pageNum = 1;
        states.dialogData.listQuery.pageSize = val;
        methods.getDialogList();
      },
      handleDialogCurrentChange(val) {
        states.dialogData.listQuery.pageNum = val;
        methods.getDialogList();
      },
      // 多选
      handleDialogSelectionChange(val){
        states.dialogData.multipleSelection = val;
      },
      handleSelectSearch(){
        methods.getDialogList();
      },
      // 添加确定
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
            flashPromotionId:states.listQuery.flashPromotionId,
            flashPromotionSessionId:states.listQuery.flashPromotionSessionId
          });
        }
        ElMessageBox.confirm('使用要进行添加操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          createFlashProductRelation(selectProducts).then(()=>{
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
      getDialogList(){
        fetchProductList(states.dialogData.listQuery).then(response=>{
          states.dialogData.list=response.data.list;
          states.dialogData.total=response.data.total;
        })
      },
    })
    // let list = reactive([])
    onMounted(()=>{
      states.listQuery.flashPromotionId = route.query.flashPromotionId;
      states.listQuery.flashPromotionSessionId = route.query.flashPromotionSessionId;
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
