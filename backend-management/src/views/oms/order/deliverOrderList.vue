<template>
  <!-- 数据框 -->
  <el-card class="operate-container" shadow="never">
    <div class="search">
      <div class="search-left-header">
        <el-icon><Tickets/></el-icon>
        <span>发货列表</span>
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
  <el-card>
    <div class="table-container">
      <el-table ref="deliverOrderTable"
                style="width: 100%;"
                :data="list" border>
        <el-table-column label="订单编号" width="200" align="center">
          <template #default="scope">{{scope.row.orderSn}}</template>
        </el-table-column>
        <el-table-column label="收货人" width="180" align="center">
          <template #default="scope">{{scope.row.receiverName}}</template>
        </el-table-column>
        <el-table-column label="手机号码" width="160" align="center">
          <template #default="scope">{{scope.row.receiverPhone}}</template>
        </el-table-column>
        <el-table-column label="邮政编码" width="160" align="center">
          <template #default="scope">{{scope.row.receiverPostCode}}</template>
        </el-table-column>
        <el-table-column label="收货地址" align="center">
          <template #default="scope">{{scope.row.address}}</template>
        </el-table-column>
        <el-table-column label="配送方式" width="160" align="center">
          <template #default="scope">
            <el-select placeholder="请选择物流公司"
                       v-model="scope.row.deliveryCompany"
                       size="small">
              <el-option v-for="item in companyOptions"
                         :key="item"
                         :label="item"
                         :value="item">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="物流单号" width="180" align="center">
          <template #default="scope">
            <el-input size="small" v-model="scope.row.deliverySn"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 15px;text-align: center">
        <el-button @click="cancel">取消</el-button>
        <el-button @click="confirm" type="primary">确定</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {deliveryOrder} from '@/api/order'
import {Tickets} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets},
  setup() {
    const defaultLogisticsCompanies=["顺丰快递","圆通快递","中通快递","韵达快递"];
    const router = useRouter();
    const route = useRoute();
    const states = reactive({
      list: [],
      companyOptions: defaultLogisticsCompanies
    })

    const methods = reactive({
      // 取消
      cancel(){
        router.back()
      },
      // 确定
      confirm(){
        ElMessageBox.confirm('是否要进行发货操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deliveryOrder(this.list).then(()=>{
            router.back();
            ElMessage({
              type: 'success',
              message: '发货成功!'
            });
          });
        }).catch(() => {
          ElMessage({
            type: 'info',
            message: '已取消发货'
          });
        });
      }
    })
    // let list = reactive([])
    onMounted(()=>{
      list = route.query.list
      let list = JSON.parse(route.query.list);
      states.list.push(...list);
      if(states.list instanceof Array===false){
        states.list=[];
      }
    })

    return {
      ...toRefs(methods),
      ...toRefs(states)
    }
  },
})
</script>
