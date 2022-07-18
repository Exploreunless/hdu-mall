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
            <el-input v-model="listQuery.orderSn" class="input-width" placeholder="订单编号"></el-input>
          </el-form-item>
          <el-form-item label="收货人：">
            <el-input v-model="listQuery.receiverKeyword" class="input-width" placeholder="收货人姓名/手机号码"></el-input>
          </el-form-item>
          <el-form-item label="提交时间：">
            <el-date-picker
              class="input-width"
              v-model="listQuery.createTime"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="请选择时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select v-model="listQuery.status" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in statusOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单分类：">
            <el-select v-model="listQuery.orderType" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in orderTypeOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单来源：">
            <el-select v-model="listQuery.sourceType" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in sourceTypeOptions"
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
        <!-- <el-button
          class="btn-add"
          @click="handleAddProduct()"
          size="small">
          添加
        </el-button> -->
      </div>
    </div>
  </el-card>
  <!-- 列表 -->
  <el-card>
    <div class="table-container">
      <el-table ref="orderTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="80" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="订单编号" width="200" align="center">
          <template #default="scope">{{scope.row.orderSn}}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" align="center">
          <template #default="scope">{{formatCreateTime(scope.row.createTime)}}</template>
        </el-table-column>
        <el-table-column label="用户账号" align="center">
          <template #default="scope">{{scope.row.memberUsername}}</template>
        </el-table-column>
        <el-table-column label="订单金额" width="120" align="center">
          <template #default="scope">￥{{scope.row.totalAmount}}</template>
        </el-table-column>
        <el-table-column label="支付方式" width="120" align="center">
          <template #default="scope">{{formatPayType(scope.row.payType)}}</template>
        </el-table-column>
        <el-table-column label="订单来源" width="120" align="center">
          <template #default="scope">{{formatSourceType(scope.row.sourceType)}}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="120" align="center">
          <template #default="scope">{{formatStatus(scope.row.status)}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleViewOrder(scope.$index, scope.row)"
            >查看订单</el-button>
            <el-button
              size="small"
              @click="handleCloseOrder(scope.$index, scope.row)"
              v-show="scope.row.status===0">关闭订单</el-button>
            <el-button
              size="small"
              @click="handleDeliveryOrder(scope.$index, scope.row)"
              v-show="scope.row.status===1">订单发货</el-button>
            <el-button
              size="small"
              @click="handleViewLogistics(scope.$index, scope.row)"
              v-show="scope.row.status===2||scope.row.status===3">订单跟踪</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDeleteOrder(scope.$index, scope.row)"
              v-show="scope.row.status===4">删除订单</el-button>
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
  <!-- 库存对话框 -->
  <el-dialog
    title="关闭订单"
    v-model="closeOrder.dialogVisible" width="30%">
    <span style="vertical-align: top">操作备注：</span>
    <el-input
      style="width: 80%"
      type="textarea"
      :rows="5"
      placeholder="请输入内容"
      v-model="closeOrder.content">
    </el-input>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="closeOrder.dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleCloseOrderConfirm">确 定</el-button>
    </span>
    </template>
  </el-dialog>
  <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog>
</template>

<script>
import {fetchList,closeOrder,deleteOrder} from '@/api/order'
import {formatDate} from '@/utils/date';
import {defineComponent, reactive, toRefs, onMounted} from 'vue'
import {Search, Tickets, Edit} from '@element-plus/icons-vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import LogisticsDialog from './components/logisticsDialog';
export default defineComponent({
    components: {Search, Tickets, Edit, LogisticsDialog},
    setup() {
      const router = useRouter()

      const defaultListQuery = {
        pageNum: 1,
        pageSize: 10,
        orderSn: null,
        receiverKeyword: null,
        status: null,
        orderType: null,
        sourceType: null,
        createTime: null,
      };
      const states = reactive({
        listQuery: Object.assign({}, defaultListQuery),
        // 列表
        listLoading: true,
        list: null,
        total: null,
        // 批量
        operateType: null,
        multipleSelection: [],

        closeOrder:{
          dialogVisible:false,
          content:null,
          orderIds:[]
        },
        // 选项
        statusOptions: [
          {
            label: '待付款',
            value: 0
          },
          {
            label: '待发货',
            value: 1
          },
          {
            label: '已发货',
            value: 2
          },
          {
            label: '已完成',
            value: 3
          },
          {
            label: '已关闭',
            value: 4
          }
        ],
        orderTypeOptions: [
          {
            label: '正常订单',
            value: 0
          },
          {
            label: '秒杀订单',
            value: 1
          }
        ],
        sourceTypeOptions: [
          {
            label: 'PC订单',
            value: 0
          },
          {
            label: 'APP订单',
            value: 1
          }
        ],
        operateOptions: [
          {
            label: "批量发货",
            value: 1
          },
          {
            label: "关闭订单",
            value: 2
          },
          {
            label: "删除订单",
            value: 3
          }
        ],
        logisticsDialogVisible:false
        
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
          // 获取订单列表
          getList(){
            states.listLoading = true;
            fetchList(states.listQuery).then(response=>{
              states.listLoading = false
              states.list = response.data.list;
              states.total = response.data.total;
            })
          },
          // 展示订单细节
          handleViewOrder(index, row){
            router.push({path:'/oms/orderDetail',query:{id:row.id}})
          },
          // 关闭订单
          handleCloseOrder(index, row){
            states.closeOrder.dialogVisible=true;
            states.closeOrder.orderIds=[row.id];
          },
          // 关闭订单的验证
          handleCloseOrderConfirm() {
            if (states.closeOrder.content == null || states.closeOrder.content === '') {
              ElMessage({
                message: '操作备注不能为空',
                type: 'warning',
                duration: 1000
              });
              return;
            }
            let params = new URLSearchParams();
            params.append('ids', states.closeOrder.orderIds);
            params.append('note', states.closeOrder.content);
            closeOrder(params).then(()=>{
              states.closeOrder.orderIds=[];
              states.closeOrder.dialogVisible=false;
              methods.getList();
              ElMessage({
                message: '修改成功',
                type: 'success',
                duration: 1000
              });
            });
          },
          // 发货
          handleDeliveryOrder(index, row){
            let listItem = methods.covertOrder(row);
            console.log("aaa", listItem)
            router.push({path:'/oms/deliverOrderList',query:{list:JSON.stringify([listItem])}})
          },
          handleViewLogistics(){
            states.logisticsDialogVisible=true;
          },
          // 删除订单操作
          handleDeleteOrder(index, row){
            let ids=[];
            ids.push(row.id);
            methods.deleteOrder(ids);
          },
          
          // 删除订单验证
          deleteOrder(ids){
            ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let params = new URLSearchParams();
              params.append("ids",ids);
              deleteOrder(params).then(()=>{
                ElMessage({
                  message: '删除成功！',
                  type: 'success',
                  duration: 1000
                });
                methods.getList();
              });
            })
          },
          // 获取发货订单信息
          covertOrder(order){
            let address=order.receiverProvince+order.receiverCity+order.receiverRegion+order.receiverDetailAddress;
            let listItem={
              orderId:order.id,
              orderSn:order.orderSn,
              receiverName:order.receiverName,
              receiverPhone:order.receiverPhone,
              receiverPostCode:order.receiverPostCode,
              address:address,
              deliveryCompany:null,
              deliverySn:null
            };
            return listItem;
          },
          // table发生变化
          handleSelectionChange(val){
            states.multipleSelection = val
          },

          // 批量操作
          handleBatchOperate(){
            if(states.multipleSelection==null||states.multipleSelection.length<1){
              ElMessage({
                message: '请选择要操作的订单',
                type: 'warning',
                duration: 1000
              });
              return;
            }
            if(states.operateType===1){
              //批量发货
              let list=[];
              for(let i=0;i<states.multipleSelection.length;i++){
                if(states.multipleSelection[i].status===1){
                  list.push(methods.covertOrder(states.multipleSelection[i]));
                }
              }
              if(list.length===0){
                ElMessage({
                  message: '选中订单中没有可以发货的订单',
                  type: 'warning',
                  duration: 1000
                });
                return;
              }
              router.push({path:'/oms/deliverOrderList',query:{list:JSON.stringify(list)}})
            }else if(states.operateType===2){
              //关闭订单
              states.closeOrder.orderIds=[];
              for(let i=0;i<states.multipleSelection.length;i++){
                states.closeOrder.orderIds.push(states.multipleSelection[i].id);
              }
              states.closeOrder.dialogVisible=true;
            }else if(states.operateType===3){
              //删除订单
              let ids=[];
              for(let i=0;i<states.multipleSelection.length;i++){
                ids.push(states.multipleSelection[i].id);
              }
              methods.deleteOrder(ids);
            }
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
          formatCreateTime(time) {
            let date = new Date(time);
            return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
          },
          formatPayType(value) {
            if (value === 1) {
              return '支付宝';
            } else if (value === 2) {
              return '微信';
            } else {
              return '未支付';
            }
          },
          formatSourceType(value) {
            if (value === 1) {
              return 'APP订单';
            } else {
              return 'PC订单';
            }
          },
          formatStatus(value) {
            if (value === 1) {
              return '待发货';
            } else if (value === 2) {
              return '已发货';
            } else if (value === 3) {
              return '已完成';
            } else if (value === 4) {
              return '已关闭';
            } else if (value === 5) {
              return '无效订单';
            } else {
              return '待付款';
            }
          },
      })
      
      onMounted(()=>{
        methods.getList();
      })
      
      return {
        ...toRefs(states),
        ...toRefs(methods),
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