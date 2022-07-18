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
          @click="searchBrandList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
        <el-button
          size="small">
          重置
        </el-button>
      </div>
      
    </div>
    <div class="search-form">
      <el-form :inline="true" :model="listQuery" label-width="140px" label-position='right'>
        <el-form-item label="输入搜索：">
          <el-input v-model="listQuery.keyword" placeholder="品牌名称"></el-input>
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
          @click="addBrand()"
          size="small">
          添加
        </el-button>
      </div>
    </div>
  </el-card>

  <el-card>
    <div class="table-container">
      <el-table ref="brandTable"
                :data="list"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                v-loading="listLoading"
                border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="100" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="品牌名称" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="品牌首字母" width="100" align="center">
          <template #default="scope">{{scope.row.firstLetter}}</template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="scope">{{scope.row.sort}}</template>
        </el-table-column>
        <el-table-column label="品牌制造商" width="100" align="center">
          <template #default="scope">
            <el-switch
              @change="handleFactoryStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.factoryStatus">
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
        <el-table-column label="相关" width="220" align="center">
          <template #default="scope">
            <span>商品：</span>
            <el-button
              size="small"
              type="text"
              @click="getProductList(scope.$index, scope.row)">100
            </el-button>
            <span>评价：</span>
            <el-button
              size="small"
              type="text"
              @click="getProductCommentList(scope.$index, scope.row)">1000
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
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {fetchBrandList as fetchList, updateShowStatus, updateFactoryStatus, deleteBrand} from '@/api/brand'
import {useRouter} from 'vue-router'
import {Search, Tickets, Edit} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
	components: {Search, Tickets, Edit},
	setup() {
		const router = useRouter();

		const states = reactive({
			list: [],
			total: null,
			listLoading: false,
			listQuery: {
          keyword: null,
          pageNum: 1,
          pageSize: 5
      },
      multipleSelection: [],
      operates: [
          {
            label: "显示品牌",
            value: "showBrand"
          },
          {
            label: "隐藏品牌",
            value: "hideBrand"
          }
      ],
      operateType: null,
		});

		const methods = reactive({
			addBrand(){
        router.push({path:'/pms/addBrand'})
      },
			getList() {
        states.listLoading = true;
        fetchList(states.listQuery).then(response => {
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

			handleFactoryStatusChange(index, row) {
        let data = new URLSearchParams();
        data.append('ids',row.id);
        data.append('factoryStatus',row.factoryStatus);
        updateFactoryStatus(data).then(()=>{
          ElMessage({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        }).catch(() => {
          if (row.factoryStatus === 0) {
            row.factoryStatus = 1;
          } else {
            row.factoryStatus = 0;
          }
        });
      },
      handleShowStatusChange(index, row) {
        let data = new URLSearchParams();
        data.append('ids',row.id);
        data.append('showStatus',row.showStatus);
        updateShowStatus(data).then(()=>{
          ElMessage({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        }).catch(() => {
          if (row.showStatus === 0) {
            row.showStatus = 1;
          } else {
            row.showStatus = 0;
          }
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleUpdate(index, row) {
        router.push({path:'/pms/updateBrand', query:{id:row.id}});
      },
      handleDelete(index, row) {
        ElMessageBox.confirm('是否要删除该品牌', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteBrand(row.id).then(() => {
            ElMessage({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            methods.getList();
          });
        });
      },
      getProductList(index, row) {
        console.log(index, row);
      },
      getProductCommentList(index, row) {
        console.log(index, row);
      },
			searchBrandList() {
        states.listQuery.pageNum = 1;
        methods.getList();
      },
      handleBatchOperate() {
        console.log(states.multipleSelection);
        if (states.multipleSelection < 1) {
          ElMessage({
            message: '请选择一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let showStatus = 0;
        if (states.operateType === 'showBrand') {
          showStatus = 1;
        } else if (states.operateType === 'hideBrand') {
          showStatus = 0;
        } else {
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
        let data = new URLSearchParams();
        data.append("ids", ids);
        data.append("showStatus", showStatus);
        updateShowStatus(data).then(() => {
          methods.getList();
          ElMessage({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
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

