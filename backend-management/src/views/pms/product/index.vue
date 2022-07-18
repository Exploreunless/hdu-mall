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
      <el-form :inline="true" :model="listQuery" label-width="140px" label-position='right'>
        <el-form-item label="输入搜索：">
          <el-input v-model="listQuery.keyword" placeholder="商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品货号：">
          <el-input v-model="listQuery.productSn" placeholder="商品货号"></el-input>
        </el-form-item>
        <el-form-item label="商品分类：">
          <el-cascader
            clearable
            v-model="selectProductCateValue"
            :options="productCateOptions">
          </el-cascader>
        </el-form-item>
        <el-form-item label="商品品牌：">
          <el-select v-model="listQuery.brandId" placeholder="请选择品牌" clearable>
            <el-option
              v-for="item in brandOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上架状态：">
          <el-select v-model="listQuery.publishStatus" placeholder="全部" clearable>
            <el-option
              v-for="item in publishStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态：">
          <el-select v-model="listQuery.verifyStatus" placeholder="全部" clearable>
            <el-option
              v-for="item in verifyStatusOptions"
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
          @click="handleAddProduct()"
          size="small">
          添加
        </el-button>
      </div>
    </div>
  </el-card>
  <!-- 列表 -->
  <el-card>
    <div class="table-container">
      <el-table ref="productTable"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border>
        <el-table-column type="selection" width="55"  align />
        <el-table-column label="编号" width="100" align>
          <template #default="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="商品图片" width="120" align="center">
          <template #default="scope"><img style="height: 80px" :src="scope.row.pic"></template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="scope">
            <p>{{scope.row.name}}</p>
            <p>品牌：{{scope.row.brandName}}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="120" align="center">
          <template #default="scope">
            <p>价格：￥{{scope.row.price}}</p>
            <p>货号：{{scope.row.productSn}}</p>
          </template>
        </el-table-column>
      
        <el-table-column label="标签" width="140" align="center">
          <template #default="scope">
            <p>上架：
              <el-switch
                @change="handlePublishStatusChange(scope.$index, scope.row)"
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.publishStatus">
              </el-switch>
            </p>
            <p>新品：
              <el-switch
                @change="handleNewStatusChange(scope.$index, scope.row)"
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.newStatus">
              </el-switch>
            </p>
            <p>推荐：
              <el-switch
                @change="handleRecommendStatusChange(scope.$index, scope.row)"
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.recommandStatus">
              </el-switch>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="scope">{{scope.row.sort}}</template>
        </el-table-column>
        <el-table-column label="SKU库存" width="100" align="center">
          <template #default="scope">
            <el-button type="primary" @click="handleShowSkuEditDialog(scope.$index, scope.row)" circle><el-icon><Edit/></el-icon></el-button>
          </template>
        </el-table-column>
        <el-table-column label="销量" width="100" align="center">
          <template #default="scope">{{scope.row.sale}}</template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="scope">
            <p>{{verifyStatusFilter(scope.row.verifyStatus)}}</p>
            <p>
              <el-button
                type="text"
                @click="handleShowVerifyDetail(scope.$index, scope.row)">审核详情
              </el-button>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <p>
              <el-button
                size="small"
                @click="handleShowProduct(scope.$index, scope.row)">查看
              </el-button>
              <el-button
                size="small"
                @click="handleUpdateProduct(scope.$index, scope.row)">编辑
              </el-button>
            </p>
            <p>
              <el-button
                size="small"
                @click="handleShowLog(scope.$index, scope.row)">日志
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)">删除
              </el-button>
            </p>
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
  </el-card>
  <!-- 库存对话框 -->
  <el-dialog
    title="编辑货品信息"
    v-model="editSkuInfo.dialogVisible"
    width="40%">
    <span>商品货号：</span>
    <span>{{editSkuInfo.productSn}}</span>
    <el-input placeholder="按sku编号搜索" v-model="editSkuInfo.keyword" size="small" style="width: 50%;margin-left: 20px">
      <template #append>
        <el-button @click="handleSearchEditSku" size="small"><el-icon><Search/></el-icon></el-button>
      </template>
    </el-input>
    <el-table style="width: 100%;margin-top: 20px"
              :data="editSkuInfo.stockList"
              border>
      <el-table-column
        label="SKU编号"
        align="center">
        <template #default="scope">
          <el-input v-model="scope.row.skuCode"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item,index) in editSkuInfo.productAttr"
        :label="item.name"
        :key="item.id"
        align="center">
        <template #default="scope">
          {{getProductSkuSp(scope.row,index)}}
        </template>
      </el-table-column>
      <el-table-column
        label="销售价格"
        width="80"
        align="center">
        <template #default="scope">
          <el-input v-model="scope.row.price"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        label="商品库存"
        width="80"
        align="center">
        <template #default="scope">
          <el-input v-model="scope.row.stock"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        label="库存预警值"
        width="100"
        align="center">
        <template #default="scope">
          <el-input v-model="scope.row.lowStock"></el-input>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editSkuInfo.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditSkuConfirm">确 定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script>
import {fetchList, updateDeleteStatus, updateNewStatus, updateRecommendStatus, updatePublishStatus} from '@/api/product'
// import {fetchBrandList} from '@/api/brand'
// import {fetchListWithChildren} from '@/api/productCate'
import {useProductCate} from '@/views/pms/productCate/js/getProductCate'
import {useBrand} from '@/views/pms/brand/js/getBrand'
import {fetchSkuList, updateSku} from '@/api/skuStock'
import {fetchProductAttrList} from '@/api/productAttr'
import {defineComponent, reactive, toRefs, ref, onMounted} from 'vue'
import {Search, Tickets, Edit} from '@element-plus/icons-vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
    components: {Search, Tickets, Edit},
    setup() {
      const productTable = ref(null)

      const router = useRouter()
      // 获取商品分类
      const {productCateOptions, getProductCateList} = useProductCate();
      const {brandOptions, getBrandList} = useBrand();

      const defaultListQuery = {
        keyword: null,
        pageNum: 1,
        pageSize: 5,
        publishStatus: null,
        verifyStatus: null,
        productSn: null,
        productCategoryId: null,
        brandId: null
      }
      const states = reactive({
          // 搜索表单数据
          listQuery: Object.assign({}, defaultListQuery),
          // 上架选项
          publishStatusOptions: [{
              value: 1,
              label: '上架'
              }, {
              value: 0,
              label: '下架'
          }],
          // 审核选项
          verifyStatusOptions: [{
              value: 1,
              label: '审核通过'
              }, {
              value: 0,
              label: '未审核'
          }],
          // 各类选项
          // brandOptions: [],
          multipleSelection: [],
          // productCateOptions: [],
          selectProductCateValue: null,
          // table数据
          listLoading: false,
          list: [],
          total: 0,
          // 库存
          editSkuInfo:{
            dialogVisible:false,
            productId:null,
            productSn:'',
            productAttributeCategoryId:null,
            stockList:[],
            productAttr:[],
            keyword:null
          },
           // 批量操作
          operateType: null,
          operates: [
          {
            label: "商品上架",
            value: "publishOn"
          },
          {
            label: "商品下架",
            value: "publishOff"
          },
          {
            label: "设为推荐",
            value: "recommendOn"
          },
          {
            label: "取消推荐",
            value: "recommendOff"
          },
          {
            label: "设为新品",
            value: "newOn"
          },
          {
            label: "取消新品",
            value: "newOff"
          },
          {
            label: "转移到分类",
            value: "transferCategory"
          },
          {
            label: "移入回收站",
            value: "recycle"
          }
        ],
        
      })
      const computedStates = reactive({
        
      })
      

      const methods = reactive({
          // 查询结果
          handleSearchList(){
            states.listQuery.pageNum = 1;
            methods.getList()
          },
          // 重置搜索框
          handleResetSearch(){
            states.listQuery = Object.assign({}, defaultListQuery)
          },
          // 跳转到添加商品界面
          handleAddProduct(){
            router.push({path:'/pms/addProduct'})
          },
          // 获取商品列表
          getList(){
            states.listLoading = true;
            fetchList(states.listQuery).then(response=>{
              states.listLoading = false
              states.list = response.data.list;
              states.total = response.data.total;
            })
          },
          // // 获取商品分类
          // getProductCateList() {
          //   fetchListWithChildren().then(response=> {
          //     let data = response.data;
          //     states.productCateOptions = [];
          //     for (let i = 0; i < data.length; i++) {
          //       let children = [];
          //       if (data[i].children != null && data[i].children.length > 0) {
          //         for (let j = 0; j < data[i].children.length; j++) {
          //           children.push({label: data[i].children[j].name, value: data[i].children[j].id});
          //         }
          //       }
          //       states.productCateOptions.push({label: data[i].name, value: data[i].id, children: children});
          //     }
          //   });
          // },
          // 获取品牌
          // getBrandList() {
          //   fetchBrandList({pageNum: 1, pageSize: 100}).then(response => {
          //     states.brandOptions = [];
          //     let brandList = response.data.list;
          //     for (let i = 0; i < brandList.length; i++) {
          //       states.brandOptions.push({label: brandList[i].name, value: brandList[i].id});
          //     }
          //   });
          // },
          // 更新上架状态
          updatePublishStatus(publishStatus, ids) {
            let params = new URLSearchParams();
            params.append('ids', ids);
            params.append('publishStatus', publishStatus);
            updatePublishStatus(params).then(() => {
              ElMessage({
                message: '修改成功',
                type: 'success',
                duration: 1000
              });
            });
          },
          // 更新新品状态
          updateNewStatus(newStatus, ids) {
            let params = new URLSearchParams();
            params.append('ids', ids);
            params.append('newStatus', newStatus);
            updateNewStatus(params).then(() => {
              ElMessage({
                message: '修改成功',
                type: 'success',
                duration: 1000
              });
            });
          },
          // 更新推荐状态
          updateRecommendStatus(recommendStatus, ids) {
            let params = new URLSearchParams();
            params.append('ids', ids);
            params.append('recommendStatus', recommendStatus);
            updateRecommendStatus(params).then(() => {
              ElMessage({
                message: '修改成功',
                type: 'success',
                duration: 1000
              });
            });
          },
          // 删除商品
          updateDeleteStatus(deleteStatus, ids) {
            let params = new URLSearchParams();
            params.append('ids', ids);
            params.append('deleteStatus', deleteStatus);
            updateDeleteStatus(params).then(() => {
              ElMessage({
                message: '删除成功',
                type: 'success',
                duration: 1000
              });
            });
            methods.getList();
          },
          // 标签发生变化事件
          handlePublishStatusChange(index, row) {
            let ids = [];
            ids.push(row.id);
            methods.updatePublishStatus(row.publishStatus, ids);
          },
          // 标签发生变化事件
          handleNewStatusChange(index, row) {
            let ids = [];
            ids.push(row.id);
            methods.updateNewStatus(row.newStatus, ids);
          },
          // 标签发生变化事件
          handleRecommendStatusChange(index, row) {
            let ids = [];
            ids.push(row.id);
            methods.updateRecommendStatus(row.recommandStatus, ids);
          },
          // sku库存操作
          handleShowSkuEditDialog(index, row){
            states.editSkuInfo.dialogVisible = true;
            states.editSkuInfo.productId=row.id;
            states.editSkuInfo.productSn=row.productSn;
            states.editSkuInfo.productAttributeCategoryId = row.productAttributeCategoryId;
            states.editSkuInfo.keyword=null;
            fetchSkuList(row.id,{keyword:states.editSkuInfo.keyword}).then(response=>{
              states.editSkuInfo.stockList=response.data;
            });
            if(row.productAttributeCategoryId!=null){
              fetchProductAttrList(row.productAttributeCategoryId,{type:0}).then(response=>{
                states.editSkuInfo.productAttr=response.data.list;
              });
            }
          },
          // 搜索sku
          handleSearchEditSku(){
            fetchSkuList(states.editSkuInfo.productId,{keyword:states.editSkuInfo.keyword}).then(response=>{
              states.editSkuInfo.stockList=response.data;
            });
          },
          // 提交编辑后的sku
          handleEditSkuConfirm(){
            if(states.editSkuInfo.stockList==null||states.editSkuInfo.stockList.length<=0){
              ElMessage({
                message: '暂无sku信息',
                type: 'warning',
                duration: 1000
              });
              return
            }
            ElMessageBox.confirm('是否要进行修改', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(()=>{
              updateSku(states.editSkuInfo.productId,states.editSkuInfo.stockList).then(()=>{
                ElMessage({
                  message: '修改成功',
                  type: 'success',
                  duration: 1000
                });
                states.editSkuInfo.dialogVisible=false;
              });
            });
          },
          // 获取商品的属性值
          getProductSkuSp(row, index) {
            let spData = JSON.parse(row.spData);
            if(spData!=null&&index<spData.length){
              return spData[index].value;
            }else{
              return null;
            }
          },
          // 审核详情
          handleShowVerifyDetail(index,row){
            console.log("handleShowVerifyDetail",row);
          },
          // 商品查看
          handleShowProduct(){
            console.log("handleShowProduct")
          },
          // 商品更新
          handleUpdateProduct(index,row){
            router.push({path:'/pms/updateProduct',query:{id:row.id}});
          },
          // 商品展示日志
          handleShowLog(){
            console.log("handleShowLog")
          },
          // 商品删除
          handleDelete(index, row){
            ElMessageBox.confirm('是否要进行删除操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let ids = [];
              ids.push(row.id);
              methods.updateDeleteStatus(1,ids);
            });
          },
          // table发生变化
          handleSelectionChange(val){
            states.multipleSelection = val
          },

          // 批量操作
          handleBatchOperate(){
            if(states.operateType==null){
              ElMessage({
                message: '请选择操作类型',
                type: 'warning',
                duration: 1000
              });
              return;
            }
            if(states.multipleSelection==null||states.multipleSelection.length<1){
              ElMessage({
                message: '请选择要操作的商品',
                type: 'warning',
                duration: 1000
              });
              return;
            }
            ElMessageBox.confirm('是否要进行该批量操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let ids=[];
              for(let i=0;i<states.multipleSelection.length;i++){
                ids.push(states.multipleSelection[i].id);
              }
              switch (states.operateType) {
                case states.operates[0].value:
                  methods.updatePublishStatus(1,ids);
                  break;
                case states.operates[1].value:
                  methods.updatePublishStatus(0,ids);
                  break;
                case states.operates[2].value:
                  methods.updateRecommendStatus(1,ids);
                  break;
                case states.operates[3].value:
                  methods.updateRecommendStatus(0,ids);
                  break;
                case states.operates[4].value:
                  methods.updateNewStatus(1,ids);
                  break;
                case states.operates[5].value:
                  methods.updateNewStatus(0,ids);
                  break;
                case states.operates[6].value:
                  break;
                case states.operates[7].value:
                  methods.updateDeleteStatus(1,ids);
                  break;
                default:
                  break;
              }
              methods.getList();
            });
          },
          
          // 分页发生变化
          handleSizeChange(val) {
            states.listQuery.pageNum = 1;
            states.listQuery.pageSize = val;
            methods.getList();
          },
          // 分页发生变化
          handleCurrentChange(val) {
            states.listQuery.pageNum = val;
            methods.getList();
          },
          // 审核状态过滤器
          verifyStatusFilter(value){
            return value===1?'审核通过':'未审核';
          }

      })

      // watch(states.selectProductCateValue, (newValue)=>{
      //   if (newValue != null && newValue.length == 2) {
      //     states.listQuery.productCategoryId = newValue[1];
      //   } else {
      //     STATEMENT_OR_BLOCK_KEYS.listQuery.productCategoryId = null;
      //   }
      // })
      
      onMounted(()=>{
        methods.getList();
        getProductCateList();
        getBrandList();
      })
      
      return {
        productTable,
        ...toRefs(states),
        ...toRefs(methods),
        ...toRefs(computedStates),
        productCateOptions,
        brandOptions
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