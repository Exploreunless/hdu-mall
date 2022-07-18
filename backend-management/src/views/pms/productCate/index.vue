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
          @click="handleAddProductCate()"
          size="small">
          添加
        </el-button>
      </div>
    </div>
  </el-card>
	<el-card>
		<div class="table-container">
      <el-table ref="productCateTable"
					style="width: 100%"
					:data="list"
					v-loading="listLoading" border>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="分类名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="级别" width="100" align="center">
          <template #default="scope">{{levelFilter(scope.row.level)}}</template>
        </el-table-column>
        <el-table-column label="商品数量" width="100" align="center">
          <template #default="scope">{{scope.row.productCount }}</template>
        </el-table-column>
        <el-table-column label="数量单位" width="100" align="center">
          <template #default="scope">{{scope.row.productUnit }}</template>
        </el-table-column>
        <el-table-column label="导航栏" width="100" align="center">
          <template #default="scope">
            <el-switch
              @change="handleNavStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.navStatus">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="是否显示" width="100" align="center">
          <template #default="scope">
            <el-switch
              @change="handleShowStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.showStatus">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="scope">{{scope.row.sort }}</template>
        </el-table-column>
        <el-table-column label="设置" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              :disabled="disableNextLevel(scope.row.level)"
              @click="handleShowNextLevel(scope.$index, scope.row)">查看下级
            </el-button>
            <el-button
              size="small"
              @click="handleTransferProduct(scope.$index, scope.row)">转移商品
            </el-button>
          </template>
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
import { defineComponent, onMounted, reactive, toRefs, watch } from 'vue'
import {fetchList,deleteProductCate,updateShowStatus,updateNavStatus} from '@/api/productCate'
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
          pageSize: 5
      },
      parentId: 0
		});
		const methods = reactive({
			handleAddProductCate(){
        router.push({path:'/pms/addProductCate'})
      },
			resetParentId(){
        states.listQuery.pageNum = 1;
        if (route.query.parentId != null) {
          states.parentId = route.query.parentId;
        } else {
          states.parentId = 0;
        }
      },
			getList() {
        states.listLoading = true;
        fetchList(states.parentId, states.listQuery).then(response => {
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

			handleNavStatusChange(index, row) {
        let data = new URLSearchParams();
        let ids=[];
        ids.push(row.id)
        data.append('ids',ids);
        data.append('navStatus',row.navStatus);
        updateNavStatus(data).then(()=>{
          ElMessage({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      handleShowStatusChange(index, row) {
        let data = new URLSearchParams();
        let ids=[];
        ids.push(row.id)
        data.append('ids',ids);
        data.append('showStatus',row.showStatus);
        updateShowStatus(data).then(()=>{
          ElMessage({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      handleShowNextLevel(index, row) {
        router.push({path: '/pms/productCate', query: {parentId: row.id}})
      },
      handleTransferProduct() {
        console.log('handleAddProductCate');
      },
      handleUpdate(index, row) {
        router.push({path:'/pms/updateProductCate', query:{id:row.id}});
      },
      handleDelete(index, row) {
        ElMessageBox.confirm('是否要删除该品牌', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteProductCate(row.id).then(() => {
            ElMessage({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            methods.getList();
          });
        });
      },
			levelFilter(value){
				if (value === 0) {
          return '一级';
        } else if (value === 1) {
          return '二级';
        }
			},
			disableNextLevel(value) {
        if (value === 0) {
          return false;
        } else {
          return true;
        }
      }
		})

		onMounted(()=>{
			methods.resetParentId()
			methods.getList();
		})

		watch(() =>router.currentRoute.value.path,()=> {
      methods.resetParentId()
			methods.getList();
		},{ immediate: true, deep: true})


		return {
			...toRefs(states),
			...toRefs(methods)
		}
	},
})
</script>
