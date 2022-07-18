import {fetchBrandList} from '@/api/brand'
import {reactive} from 'vue'
// 获取品牌分类
export const useBrand = function(){
    const brandOptions = reactive([]);

    const getBrandList = () => {
        fetchBrandList({pageNum: 1, pageSize: 100}).then(response => {
          brandOptions.splice(0);
          let brandList = response.data.list;
          for (let i = 0; i < brandList.length; i++) {
            brandOptions.push({label: brandList[i].name, value: brandList[i].id});
          }
        });
      }
    return {brandOptions, getBrandList}
}