import {fetchListWithChildren} from '@/api/productCate'
import {reactive} from 'vue'
// 获取商品分类
export const useProductCate = function(){
    const productCateOptions = reactive([]);

    const getProductCateList = ()=>{
        return fetchListWithChildren().then(response=> {
            let data = response.data;
            productCateOptions.splice(0);
            for (let i = 0; i < data.length; i++) {
            let children = [];
            if (data[i].children != null && data[i].children.length > 0) {
                for (let j = 0; j < data[i].children.length; j++) {
                children.push({label: data[i].children[j].name, value: data[i].children[j].id});
                }
            }
            productCateOptions.push({label: data[i].name, value: data[i].id, children: children});
            }
        });
    };

    return {productCateOptions, getProductCateList}
}

