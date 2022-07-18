<template>
  <el-card class="operate-container" shadow="never">
    <div class="search">
      <div class="search-left-header">
        <el-icon><Tickets/></el-icon>
        <span>数据列表</span>
      </div>
      <div class="search-right-header">
        <el-button
          class="btn-add"
          @click="addProductAttr()"
          size="small">
          添加
        </el-button>
      </div>
    </div>
  </el-card>
	<el-card>
		<div class="table-container">
      <el-table ref="productAttrTable"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="属性名称" width="140" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="商品类型" width="140" align="center">
          <template>{{$route.query.cname}}</template>
        </el-table-column>
        <el-table-column label="属性是否可选" width="120" align="center">
          <template #default="scope">{{selectTypeFilter(scope.row.selectType)}}</template>
        </el-table-column>
        <el-table-column label="属性值的录入方式" width="150" align="center">
          <template #default="scope">{{inputTypeFilter(scope.row.inputType)}}</template>
        </el-table-column>
        <el-table-column label="可选值列表" align="center">
          <template #default="scope">{{scope.row.inputList}}</template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="scope">{{scope.row.sort}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
</template>
<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {fetchProductAttrList, deleteProductAttr} from '@/api/productAttr'
import {useRouter, useRoute} from 'vue-router'
import {Search, Tickets, Edit} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
	components: {Search, Tickets, Edit},
	setup() {
		const router = useRouter();
		const route = useRoute();

		const states = reactive({
			list: [],
			total: null,
			listLoading: false,
			listQuery: {
          pageNum: 1,
          pageSize: 5,
          type: route.query.type
      },

      operateType: null,
      multipleSelection: [],
      operates: [
        {
          label: "删除",
          value: "deleteProductAttr"
        }
      ]
		});
		const methods = reactive({
			addProductAttr(){
        router.push({path:'/pms/addProductAttr', query:{cid:route.query.cid,type:route.query.type}})
      },
			
			getList() {
        states.listLoading = true;
        fetchProductAttrList(route.query.cid, states.listQuery).then(response => {
          states.listLoading = false;
          states.list = response.data.list;
          states.total = response.data.total;
        });
      },

      handleSizeChange(val) {
        states.listQuery.pageNum = 1;
        states.listQuery.pageSize = val;
        methods.getList();
      },
      handleCurrentChange(val) {
        states.listQuery.pageNum = val;
        methods.getList();
      },
     
      handleShowNextLevel(index, row) {
        router.push({path: '/pms/productCate', query: {parentId: row.id}})
      },
      handleUpdate(index, row) {
        router.push({path:'/pms/updateProductAttr', query:{id:row.id}});
      },
      handleDeleteProductAttr(ids) {
        ElMessageBox.confirm('是否要删除该属性', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = new URLSearchParams();
          data.append("ids", ids);
          deleteProductAttr(data).then(() => {
            ElMessage({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            methods.getList();
          });
        });
      },

      handleDelete(index, row) {
        let ids = [];
        ids.push(row.id);
        methods.handleDeleteProductAttr(ids);
      },
      handleSelectionChange(val) {
        states.multipleSelection = val;
      },
      handleBatchOperate() {
        if (states.multipleSelection < 1) {
          ElMessage({
            message: '请选择一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if (states.operateType !== 'deleteProductAttr') {
          ElMessage({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let ids = [];
        for (let i = 0; i < states.multipleSelection.length; i++) {
          ids.push(states.multipleSelection[i].id);
        }
        methods.handleDeleteProductAttr(ids);
      },
      inputTypeFilter(value) {
        if (value === 1) {
          return '从列表中选取';
        } else {
          return '手工录入'
        }
      },
      selectTypeFilter(value) {
        if (value === 1) {
          return '单选';
        } else if (value === 2) {
          return '多选';
        } else {
          return '唯一'
        }
      },
		})

		onMounted(()=>{
			methods.getList();
		})

		return {
			...toRefs(states),
			...toRefs(methods)
		}
	},
})
</script>
