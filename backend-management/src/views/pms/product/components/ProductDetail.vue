<template>
  <el-card  shadow="never">
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="填写商品信息"></el-step>
      <el-step title="填写商品促销"></el-step>
      <el-step title="填写商品属性"></el-step>
      <el-step title="选择商品关联"></el-step>
    </el-steps>
    <div class="form-container">
      <product-info-detail
        v-show="showStatus[0]"
        v-model="productParam"
        :is-edit="isEdit"
        @nextStep="nextStep">
        </product-info-detail>
        <product-sale-detail
        v-show="showStatus[1]"
        v-model="productParam"
        :is-edit="isEdit"
        @nextStep="nextStep"
        @prevStep="prevStep">
        </product-sale-detail>
        <product-attr-detail
        v-show="showStatus[2]"
        v-model="productParam"
        :is-edit="isEdit"
        @nextStep="nextStep"
        @prevStep="prevStep">
        </product-attr-detail>
        <product-relation-detail
        v-show="showStatus[3]"
        v-model="productParam"
        :is-edit="isEdit"
        @prevStep="prevStep"
        @finishCommit="finishCommit">
        </product-relation-detail>
    </div>
  </el-card>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {createProduct,getProduct,updateProduct} from '@/api/product';
import {ProductInfoDetail, ProductSaleDetail, ProductAttrDetail, ProductRelationDetail} from './index';
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {ProductInfoDetail, ProductSaleDetail, ProductAttrDetail, ProductRelationDetail},
  props:{
    isEdit:{
      type: Boolean,
      default: false 
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const {isEdit} = toRefs(props)
    const defaultProductParam = {
        albumPics: '',
        brandId: null,
        brandName: '',
        deleteStatus: 0,
        description: '',
        detailDesc: '',
        detailHtml: '',
        detailMobileHtml: '',
        detailTitle: '',
        feightTemplateId: 0,
        flashPromotionCount: 0,
        flashPromotionId: 0,
        flashPromotionPrice: 0,
        flashPromotionSort: 0,
        giftPoint: 0,
        giftGrowth: 0,
        keywords: '',
        lowStock: 0,
        name: '',
        newStatus: 0,
        note: '',
        originalPrice: 0,
        pic: '',
        //会员价格{memberLevelId: 0,memberPrice: 0,memberLevelName: null}
        memberPriceList: [],
        //商品满减
        productFullReductionList: [{fullPrice: 0, reducePrice: 0}],
        //商品阶梯价格
        productLadderList: [{count: 0,discount: 0,price: 0}],
        previewStatus: 0,
        price: 0,
        productAttributeCategoryId: null,
        //商品属性相关{productAttributeId: 0, value: ''}
        productAttributeValueList: [],
        //商品sku库存信息{lowStock: 0, pic: '', price: 0, sale: 0, skuCode: '', spData: '', stock: 0}
        skuStockList: [],
        //商品相关专题{subjectId: 0}
        subjectProductRelationList: [],
        //商品相关优选{prefrenceAreaId: 0}
        prefrenceAreaProductRelationList: [],
        productCategoryId: null,
        productCategoryName: '',
        productSn: '',
        promotionEndTime: '',
        promotionPerLimit: 0,
        promotionPrice: null,
        promotionStartTime: '',
        promotionType: 0,
        publishStatus: 0,
        recommandStatus: 0,
        sale: 0,
        serviceIds: '',
        sort: 0,
        stock: 0,
        subTitle: '',
        unit: '',
        usePointLimit: 0,
        verifyStatus: 0,
        weight: 0
    };

    const states = reactive({
      active: 0,
      productParam: Object.assign({}, defaultProductParam),
      showStatus: [true, false, false, false],
      
    })

    const methods = reactive({
      hideAll(){
        for (let i = 0; i < states.showStatus.length; i++) {
          states.showStatus[i] = false;
        }
      },
      prevStep() {
        if (states.active > 0 && states.active < states.showStatus.length) {
          states.active--;
          methods.hideAll();
          states.showStatus[states.active] = true;
        }
      },
      nextStep() {
        if (states.active < states.showStatus.length - 1) {
          states.active++;
          methods.hideAll();
          states.showStatus[states.active] = true;
        }
      },

      finishCommit() {
        console.log(states.productParam)
        ElMessageBox.confirm('是否要提交该产品', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(isEdit.value){
            updateProduct(route.query.id,states.productParam).then(()=>{
              ElMessage({
                type: 'success',
                message: '提交成功',
                duration:1000
              });
              router.back();
            });
          }else{
            createProduct(states.productParam).then(()=>{
              ElMessage({
                type: 'success',
                message: '提交成功',
                duration:1000
              });
              location.reload();
            });
          }
        })
      }
    })

    onMounted(()=>{
      if(isEdit.value){
        getProduct(route.query.id).then(response=>{
          states.productParam=response.data;
        });
      }
    })
    return {
        ...toRefs(states),
        ...toRefs(methods)
    }
  },
})
</script>

<style lang="less" scoped>
  .el-card{
    width: 800px;
    margin: 0 auto;
    .form-container{
        margin-top: 50px;
        display: flex;
        justify-content: center;
        font-size: 20px;
    }
  }
</style>
