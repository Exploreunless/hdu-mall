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
        <el-form-item label="优惠券名称：">
        <el-input v-model="listQuery.name" class="input-width" placeholder="优惠券名称"></el-input>
        </el-form-item>
        <el-form-item label="优惠券类型：">
        <el-select v-model="listQuery.type" placeholder="全部" clearable class="input-width">
            <el-option v-for="item in typeOptions"
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
      </div>
    </div>
  </el-card>
  <!-- table -->
  <el-card>
    <div class="table-container">
      <el-table ref="couponTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="优惠劵名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="优惠券类型" width="100" align="center">
          <template #default="scope">{{formatType(scope.row.type)}}</template>
        </el-table-column>
        <el-table-column label="可使用商品" width="100" align="center">
          <template #default="scope">{{formatUseType(scope.row.useType)}}</template>
        </el-table-column>
        <el-table-column label="使用门槛" width="140" align="center">
          <template #default="scope">满{{scope.row.minPoint}}元可用</template>
        </el-table-column>
        <el-table-column label="面值" width="100" align="center">
          <template #default="scope">{{scope.row.amount}}元</template>
        </el-table-column>
        <el-table-column label="适用平台" width="100" align="center">
          <template #default="scope">{{formatPlatform(scope.row.platform)}}</template>
        </el-table-column>
        <el-table-column label="有效期" width="180" align="center">
          <template #default="scope">{{formatDate(scope.row.startTime)}}至{{formatDate(scope.row.endTime)}}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">{{formatStatus(scope.row.endTime)}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small"
                       type="text"
                       @click="handleView(scope.$index, scope.row)">查看</el-button>
            <el-button size="small"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">
              编辑</el-button>
            <el-button size="small"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {useRouter} from 'vue-router'
import {formatDate} from '@/utils/date';
 import {fetchList,deleteCoupon} from '@/api/coupon';
import {Tickets, Search} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {Tickets, Search},
  setup() {
    const defaultListQuery = {
      pageNum: 1,
      pageSize: 10,
      name: null,
      type: null
    };
    const defaultTypeOptions=[
      {
        label: '全场赠券',
        value: 0
      },
      {
        label: '会员赠券',
        value: 1
      },
      {
        label: '购物赠券',
        value: 2
      },
      {
        label: '注册赠券',
        value: 3
      }
    ];
    const router = useRouter();
    const states = reactive({
      listQuery:Object.assign({},defaultListQuery),
      typeOptions:Object.assign({},defaultTypeOptions),
      list:null,
      total:null,
      listLoading:false,
      multipleSelection:[]
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
      handleSelectionChange(val){
        states.multipleSelection = val;
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
        ElMessageBox.confirm('是否要删除该优惠卷?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCoupon(row.id).then(() => {
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
        router.push({path: '/sms/addCoupon'})
      },
      handleView(index, row) {
        router.push({path: '/sms/couponHistory', query: {id: row.id}})
      },
      // 编辑活动
      handleUpdate(index, row) {
        router.push({path: '/sms/updateCoupon', query: {id: row.id}})
      },
     
      // 过滤器
      formatType(type){
        for(let i=0;i<defaultTypeOptions.length;i++){
          if(type===defaultTypeOptions[i].value){
            return defaultTypeOptions[i].label;
          }
        }
        return '';
      },
      formatUseType(useType){
        if(useType===0){
          return '全场通用';
        }else if(useType===1){
          return '指定分类';
        }else{
          return '指定商品';
        }
      },
      formatPlatform(platform){
        if(platform===1){
          return '移动平台';
        }else if(platform===2){
          return 'PC平台';
        }else{
          return '全平台';
        }
      },
      formatDate(time){
        if(time==null||time===''){
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd')
      },
      formatStatus(endTime){
        let now = new Date().getTime();
        let endDate = new Date(endTime);
        if(endDate>now){
          return '未过期'
        }else{
          return '已过期';
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
