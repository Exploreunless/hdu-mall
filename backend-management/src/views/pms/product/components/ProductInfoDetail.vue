<template>
  <div>
    <el-form :model="newValues" :rules="rules" ref="productInfoForm" label-width="120px" style="width: 600px" >
      <el-form-item label="商品分类：" prop="productCategoryId">
        <el-cascader
          v-model="selectProductCateValue"
          :options="productCateOptions">
        </el-cascader>
      </el-form-item>
      <el-form-item label="商品名称：" prop="name">
        <el-input v-model="newValues.name"></el-input>
      </el-form-item>
      <el-form-item label="副标题：" prop="subTitle">
        <el-input v-model="newValues.subTitle"></el-input>
      </el-form-item>
      <el-form-item label="商品品牌：" prop="brandId">
        <el-select
          v-model="newValues.brandId"
          @change="handleBrandChange"
          placeholder="请选择品牌">
          <el-option
            v-for="item in brandOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品介绍：">
        <el-input
          :autoSize="true"
          v-model="newValues.description"
          type="textarea"
          placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="商品货号：">
        <el-input v-model="newValues.productSn"></el-input>
      </el-form-item>
      <el-form-item label="商品售价：">
        <el-input v-model="newValues.price"></el-input>
      </el-form-item>
      <el-form-item label="市场价：">
        <el-input v-model="newValues.originalPrice"></el-input>
      </el-form-item>
      <el-form-item label="商品库存：">
        <el-input v-model="newValues.stock"></el-input>
      </el-form-item>
      <el-form-item label="计量单位：">
        <el-input v-model="newValues.unit"></el-input>
      </el-form-item>
      <el-form-item label="商品重量：">
        <el-input v-model="newValues.weight" style="width: 300px"></el-input>
        <span style="margin-left: 10px">克</span>
      </el-form-item>
      <el-form-item label="排序：">
        <el-input v-model="newValues.sort"></el-input>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary"  @click="handleNext('productInfoForm')">下一步，填写商品促销</el-button>
      </el-form-item>
    </el-form>
  </div>
  
</template>

<script>
import {defineComponent, onMounted, reactive, toRefs, ref, watch, computed} from 'vue'
import {useProductCate} from '@/views/pms/productCate/js/getProductCate'
import {useBrand} from '@/views/pms/brand/js/getBrand'
import {ElMessage} from 'element-plus'
export default defineComponent({
  props: {
    modelValue: Object,
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props, {emit}) {   //  (value, isEdit)
    const productInfoForm = ref(null)
    const {modelValue: newValues, isEdit} = toRefs(props)
    const ProductCate = useProductCate()
    const brand = useBrand()
    
    const states = reactive({
      rules: {
        name: [
          {required: true, message: '请输入商品名称', trigger: 'blur'},
          {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
        ],
        subTitle: [{required: true, message: '请输入商品副标题', trigger: 'blur'}],
        productCategoryId: [{required: true, message: '请选择商品分类', trigger: 'blur'}],
        brandId: [{required: true, message: '请选择商品品牌', trigger: 'blur'}],
        description: [{required: true, message: '请输入商品介绍', trigger: 'blur'}],
        requiredProp: [{required: true, message: '该项为必填项', trigger: 'blur'}]
      },
      selectProductCateValue: [],
      hasEditCreated: false,

    })

    const methods = reactive({
      handleEditCreated(){
        if(newValues.value.productCategoryId!=null){
          states.selectProductCateValue.push(newValues.value.cateParentId);
          states.selectProductCateValue.push(newValues.value.productCategoryId);
        }
        states.hasEditCreated=true;
      },
      handleBrandChange(val){
        let brandName = '';
        let brandOptions = brand.brandOptions;
        for (let i = 0; i < brandOptions.length; i++) {
          if (brandOptions[i].value === val) {
            brandName = brandOptions[i].label;
            break;
          }
        }
        newValues.value.brandName = brandName;
      },

      handleNext(){
        productInfoForm.value.validate((valid) => {
          if (valid) {
            emit('nextStep');
          } else {
            ElMessage({
              message: '验证失败',
              type: 'error',
              duration:1000
            });
            return false;
          }
        });
      },
      getCateNameById(id){
        let name=null;
        for(let i=0;i<ProductCate.productCateOptions.length;i++){
          for(let j=0;j<ProductCate.productCateOptions[i].children.length;j++){
            if(ProductCate.productCateOptions[i].children[j].value===id){
              name=ProductCate.productCateOptions[i].children[j].label;
              return name;
            }
          }
        }
        return name;
      }
    });
    const productId = computed(
      ()=>{
        return newValues.value.id;
      }
    )
    
    watch(
      ()=>states.selectProductCateValue,  (newValue)=> {
        if (newValue != null && newValue.length === 2) {
          newValues.value.productCategoryId = newValue[1];
          newValues.value.productCategoryName= methods.getCateNameById(newValue[1]);
        } else {
          newValues.value.productCategoryId = null;
          newValues.value.productCategoryName=null;
        }
      },
      ()=>productId, (newValue)=>{
        if(!isEdit.value) return;
        if(states.hasEditCreated) return;
        if(newValue===undefined||newValue==null||newValue===0)return;
        methods.handleEditCreated();
      }
    )

    const unwatch = watch(()=>newValues.value, (newValue)=>{
      if(newValue.productCategoryId || newValue.productCategoryId===0){
        const cate = ProductCate.productCateOptions.find((item)=>{
          if(item.children && item.children.length){
            return item.children.some(subItem=>(subItem.value === newValue.productCategoryId));
          }
          return false;
        });
        states.selectProductCateValue = [cate['value'], newValue.productCategoryId];
        unwatch();
      }
    })
  
  
    onMounted(()=>{
      ProductCate.getProductCateList();
      // .then(()=>{
      //   console.log(ProductCate.productCateOptions)
      //   if(newValues.value.productCategoryId || newValues.value.productCategoryId===0){
      //     const cate = ProductCate.productCateOptions.find((item)=>{
      //       if(item.children && item.children.length){
      //         return item.children.some(subItem=>(subItem.value === newValues.value.productCategoryId));
      //       }
      //       return false;
      //     })

      //     states.selectProductCateValue.unshift(cate['value']);
      //     // console.log('aa')
      //   }
      // });
      brand.getBrandList()
    })

    return {
      productId,
      newValues,
      productInfoForm,
      ...toRefs(states),
      ...toRefs(methods),
      // ...toRefs(computedStates),
      ...ProductCate,
      ...brand
    }
  },
})
</script>

<style scoped>

</style>
