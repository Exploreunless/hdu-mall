<template>
  <div>
    <el-form :model="newValues" ref="productAttrForm" label-width="120px" style="width: 720px" >
      <el-form-item label="属性类型：">
        <el-select v-model="newValues.productAttributeCategoryId"
            placeholder="请选择属性类型"
            @change="handleProductAttrChange">
          <el-option
            v-for="item in productAttributeCategoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <!-- {{productAttributeCategoryOptions}} -->
      </el-form-item>
      <el-form-item label="商品规格：">
        <el-card shadow="never" class="cardBg">
          <div v-for="(productAttr, idx) in selectProductAttr" :key="idx">
            {{productAttr.name}}:
            <el-checkbox-group v-if="productAttr.handAddStatus===0" v-model="selectProductAttr[idx].values">
              <el-checkbox v-for="item in getInputListArr(productAttr.inputList)" :label="item" :key="item"
                           class="littleMarginLeft"></el-checkbox>
            </el-checkbox-group>
            <div v-else>
              <el-checkbox-group v-model="selectProductAttr[idx].values">
                <div v-for="(item,index) in selectProductAttr[idx].options" style="display: inline-block"
                     class="littleMarginLeft" :key="index">
                  <el-checkbox :label="item" :key="item"></el-checkbox>
                  <el-button type="text" class="littleMarginLeft" @click="handleRemoveProductAttrValue(idx,index)">删除
                  </el-button>
                </div>
              </el-checkbox-group>
              <el-input v-model="addProductAttrValue" style="width: 160px;margin-left: 10px" clearable></el-input>
              <el-button class="littleMarginLeft" @click="handleAddProductAttrValue(idx)">增加</el-button>
            </div>
          </div>
        </el-card>
        <el-table style="width: 100%;margin-top: 20px"
                  :data="newValues.skuStockList"
                  border>
          <el-table-column
            v-for="(item,index) in selectProductAttr"
            :label="item.name"
            :key="item.id"
            align="center">
            <template #default="scope">
              {{getProductSkuSp(scope.row,index)}}
            </template>
          </el-table-column>
          <el-table-column
            label="销售价格"
            width="80"
            align="center">
            <template #default="scope">
              <el-input v-model="scope.row.price"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="商品库存"
            width="80"
            align="center">
            <template #default="scope">
              <el-input v-model="scope.row.stock"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="库存预警值"
            width="80"
            align="center">
            <template #default="scope">
              <el-input v-model="scope.row.lowStock"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="SKU编号"
            align="center">
            <template #default="scope">
              <el-input v-model="scope.row.skuCode"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            align="center">
            <template #default="scope">
              <el-button
                type="text"
                @click="handleRemoveProductSku(scope.$index, scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          style="margin-top: 20px"
          @click="handleRefreshProductSkuList">刷新列表
        </el-button>
        <el-button
          type="primary"
          style="margin-top: 20px"
          @click="handleSyncProductSkuPrice">同步价格
        </el-button>
        <el-button
          type="primary"
          style="margin-top: 20px"
          @click="handleSyncProductSkuStock">同步库存
        </el-button>
      </el-form-item>
      <el-form-item label="属性图片：" v-if="hasAttrPic">
        <el-card shadow="never" class="cardBg">
          <div v-for="(item,index) in selectProductAttrPics" :key="index">
            <span>{{item.name}}:</span>
            <single-upload v-model="item.pic"
                style="width: 300px;display: inline-block;margin-left: 10px"></single-upload>
          </div>
        </el-card>
      </el-form-item>
      <el-form-item label="商品参数：">
        <el-card shadow="never" class="cardBg">
          <div v-for="(item,index) in selectProductParam" :class="{littleMarginTop:index!==0}" :key="index">
            <div class="paramInputLabel">{{item.name}}:</div>
            <el-select v-if="item.inputType===1" class="paramInput" v-model="selectProductParam[index].value">
              <el-option
                v-for="item in getParamInputList(item.inputList)"
                :key="item"
                :label="item"
                :value="item">
              </el-option>
            </el-select>
            <el-input v-else class="paramInput" v-model="selectProductParam[index].value"></el-input>
          </div>
        </el-card>
      </el-form-item>
      <el-form-item label="商品相册：">
        <multi-upload v-model="selectProductPics"></multi-upload>
      </el-form-item>
      <el-form-item label="规格参数：">
        <el-tabs v-model="activeHtmlName" type="card">
          <el-tab-pane label="电脑端详情" name="pc">
            <tinymce v-model="newValues.detailHtml"></tinymce>
          </el-tab-pane>
          <el-tab-pane label="移动端详情" name="mobile">
            <tinymce v-model="newValues.detailMobileHtml"></tinymce>
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button  @click="handlePrev">上一步，填写商品促销</el-button>
        <el-button type="primary"  @click="handleNext">下一步，选择商品关联</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, reactive, toRefs, watch } from 'vue'
import {fetchList as fetchProductAttrCateList} from '@/api/productAttrCate'
import {fetchProductAttrList} from '@/api/productAttr'
import SingleUpload from '@/components/Upload/singleUpload'
import MultiUpload from '@/components/Upload/multiUpload'
import Tinymce from '@/components/Tinymce';
import {ElMessage, ElMessageBox} from 'element-plus'
export default defineComponent({
  components: {SingleUpload, MultiUpload, Tinymce},
  props: {
    modelValue: Object,
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props, {emit}) {
    const {modelValue: newValues, isEdit} = toRefs(props)

    const states = reactive({
      //编辑模式时是否初始化成功
      hasEditCreated:false,
      //商品属性分类下拉选项
      productAttributeCategoryOptions: [],
      //选中的商品属性
      selectProductAttr: [],
      //选中的商品参数
      selectProductParam: [],
      //选中的商品属性图片
      selectProductAttrPics: [],
      //可手动添加的商品属性
      addProductAttrValue: '',
      //商品富文本详情激活类型
      activeHtmlName: 'pc'
    });
    const hasAttrPic = computed(()=>{
      if (states.selectProductAttrPics.length < 1) {
          return false;
        }
        return true;
    })

    const productId = computed(()=>{
      return newValues.value.id;
    })
    const methods = reactive({
      handleEditCreated() {
        //根据商品属性分类id获取属性和参数
        if(newValues.value.productAttributeCategoryId!=null){
          methods.handleProductAttrChange(newValues.value.productAttributeCategoryId);
        }
        states.hasEditCreated=true;
      },

      getProductAttrCateList(){
        let param = {pageNum: 1, pageSize: 100};
        fetchProductAttrCateList(param).then(response => {
          states.productAttributeCategoryOptions.splice(0);
          let list = response.data.list;
          for (let i = 0; i < list.length; i++) {
            states.productAttributeCategoryOptions.push({label: list[i].name, value: list[i].id});
          }
        });
        
      },
      getProductAttrList(type, cid) {
        let param = {pageNum: 1, pageSize: 100, type: type};
        fetchProductAttrList(cid, param).then(response => {
          let list = response.data.list;
          if (type === 0) {
            states.selectProductAttr.splice(0);
            for (let i = 0; i < list.length; i++) {
              let options = [];
              let values = [];
              if (isEdit){
                if (list[i].handAddStatus === 1) {
                  //编辑状态下获取手动添加编辑属性
                  options = methods.getEditAttrOptions(list[i].id);
                }
                //编辑状态下获取选中属性
                values = methods.getEditAttrValues(i);
              }
              states.selectProductAttr.push({
                id: list[i].id,
                name: list[i].name,
                handAddStatus: list[i].handAddStatus,
                inputList: list[i].inputList,
                values: values,
                options: options
              });
            }
            if(isEdit){
              //编辑模式下刷新商品属性图片
              methods.refreshProductAttrPics();
            }
          } else {
            states.selectProductParam.splice(0);
            for (let i = 0; i < list.length; i++) {
              let value=null;
              if(isEdit){
                //编辑模式下获取参数属性
                value= methods.getEditParamValue(list[i].id);
              }
              states.selectProductParam.push({
                id: list[i].id,
                name: list[i].name,
                value: value,
                inputType: list[i].inputType,
                inputList: list[i].inputList
              });
            }
          }
        });
      },
      //获取设置的可手动添加属性值
      getEditAttrOptions(id) {
        let options = [];
        for (let i = 0; i < newValues.value.productAttributeValueList.length; i++) {
          let attrValue = newValues.value.productAttributeValueList[i];
          if (attrValue.productAttributeId === id) {
            let strArr = attrValue.value.split(',');
            for (let j = 0; j < strArr.length; j++) {
              options.push(strArr[j]);
            }
            break;
          }
        }
        return options;
      },
      //获取选中的属性值
      getEditAttrValues(index) {
        let values = new Set();
        if (index === 0) {
          for (let i = 0; i < newValues.value.skuStockList.length; i++) {
            let sku = newValues.value.skuStockList[i];
            let spData = JSON.parse(sku.spData);
            if (spData!= null && spData.length>=1) {
              values.add(spData[0].value);
            }
          }
        } else if (index === 1) {
          for (let i = 0; i < newValues.value.skuStockList.length; i++) {
            let sku = newValues.value.skuStockList[i];
            let spData = JSON.parse(sku.spData);
            if (spData!= null && spData.length>=2) {
              values.add(spData[1].value);
            }
          }
        } else {
          for (let i = 0; i < newValues.value.skuStockList.length; i++) {
            let sku = newValues.value.skuStockList[i];
            let spData = JSON.parse(sku.spData);
            if (spData!= null && spData.length>=3) {
              values.add(spData[2].value);
            }
          }
        }
        return Array.from(values);
      },
      //获取属性的值
      getEditParamValue(id){
        for(let i=0;i<newValues.value.productAttributeValueList.length;i++){
          if(id===newValues.value.productAttributeValueList[i].productAttributeId){
            return newValues.value.productAttributeValueList[i].value;
          }
        }
      },
      handleProductAttrChange(value) {
        methods.getProductAttrList(0, value);
        methods.getProductAttrList(1, value);
      },
      getInputListArr(inputList) {
        return inputList.split(',');
      },
      handleAddProductAttrValue(idx) {
        let options = states.selectProductAttr[idx].options;
        if (states.addProductAttrValue == null || states.addProductAttrValue == '') {
          ElMessage({
            message: '属性值不能为空',
            type: 'warning',
            duration: 1000
          });
          return
        }
        if (options.indexOf(states.addProductAttrValue) !== -1) {
          ElMessage({
            message: '属性值不能重复',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        states.selectProductAttr[idx].options.push(states.addProductAttrValue);
        states.addProductAttrValue = null;
      },
      handleRemoveProductAttrValue(idx, index) {
        states.selectProductAttr[idx].options.splice(index, 1);
      },
      getProductSkuSp(row, index) {
        let spData = JSON.parse(row.spData);
        if(spData!=null&&index<spData.length){
          return spData[index].value;
        }else{
          return null;
        }
      },
      handleRefreshProductSkuList() {
        ElMessageBox.confirm('刷新列表将导致sku信息重新生成,是否要刷新', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          methods.refreshProductAttrPics();
          methods.refreshProductSkuList();
        });
      },
      handleSyncProductSkuPrice(){
        ElMessageBox.confirm('将同步第一个sku的价格到所有sku,是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(newValues.value.skuStockList!==null&&newValues.value.skuStockList.length>0){
            let tempSkuList = [];
            tempSkuList = tempSkuList.concat(tempSkuList,newValues.value.skuStockList);
            let price=newValues.value.skuStockList[0].price;
            for(let i=0;i<tempSkuList.length;i++){
              tempSkuList[i].price=price;
            }
            newValues.value.skuStockList=[];
            newValues.value.skuStockList=newValues.value.skuStockList.concat(newValues.value.skuStockList,tempSkuList);
          }
        });
      },
      handleSyncProductSkuStock(){
        ElMessageBox.confirm('将同步第一个sku的库存到所有sku,是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(newValues.value.skuStockList!==null&&newValues.value.skuStockList.length>0){
            let tempSkuList = [];
            tempSkuList = tempSkuList.concat(tempSkuList,newValues.value.skuStockList);
            let stock=newValues.value.skuStockList[0].stock;
            let lowStock=newValues.value.skuStockList[0].lowStock;
            for(let i=0;i<tempSkuList.length;i++){
              tempSkuList[i].stock=stock;
              tempSkuList[i].lowStock=lowStock;
            }
            newValues.value.skuStockList=[];
            newValues.value.skuStockList=newValues.value.skuStockList.concat(newValues.value.skuStockList,tempSkuList);
          }
        });
      },
      refreshProductSkuList() {
        newValues.value.skuStockList = [];
        let skuList = newValues.value.skuStockList;
        //只有一个属性时
        if (states.selectProductAttr.length === 1) {
          let attr = states.selectProductAttr[0];
          for (let i = 0; i < attr.values.length; i++) {
            skuList.push({
              spData: JSON.stringify([{key:attr.name,value:attr.values[i]}])
            });
          }
        } else if (states.selectProductAttr.length === 2) {
          let attr0 = states.selectProductAttr[0];
          let attr1 = states.selectProductAttr[1];
          for (let i = 0; i < attr0.values.length; i++) {
            if (attr1.values.length === 0) {
              skuList.push({
                spData: JSON.stringify([{key:attr0.name,value:attr0.values[i]}])
              });
              continue;
            }
            for (let j = 0; j < attr1.values.length; j++) {
              let spData = [];
              spData.push({key:attr0.name,value:attr0.values[i]});
              spData.push({key:attr1.name,value:attr1.values[j]});
              skuList.push({
                spData: JSON.stringify(spData)
              });
            }
          }
        } else {
          let attr0 = states.selectProductAttr[0];
          let attr1 = states.selectProductAttr[1];
          let attr2 = states.selectProductAttr[2];
          for (let i = 0; i < attr0.values.length; i++) {
            if (attr1.values.length === 0) {
              skuList.push({
                spData: JSON.stringify([{key:attr0.name,value:attr0.values[i]}])
              });
              continue;
            }
            for (let j = 0; j < attr1.values.length; j++) {
              if (attr2.values.length === 0) {
                let spData = [];
                spData.push({key:attr0.name,value:attr0.values[i]});
                spData.push({key:attr1.name,value:attr1.values[j]});
                skuList.push({
                  spData: JSON.stringify(spData)
                });
                continue;
              }
              for (let k = 0; k < attr2.values.length; k++) {
                let spData = [];
                spData.push({key:attr0.name,value:attr0.values[i]});
                spData.push({key:attr1.name,value:attr1.values[j]});
                spData.push({key:attr2.name,value:attr2.values[k]});
                skuList.push({
                  spData: JSON.stringify(spData)
                });
              }
            }
          }
        }
      },
      refreshProductAttrPics() {
        states.selectProductAttrPics.splice(0);
        if (states.selectProductAttr.length >= 1) {
          let values = states.selectProductAttr[0].values;
          for (let i = 0; i < values.length; i++) {
            let pic=null;
            if(isEdit){
              //编辑状态下获取图片
              pic=methods.getProductSkuPic(values[i]);
            }
            states.selectProductAttrPics.push({name: values[i], pic: pic})
          }
        }
      },
      //获取商品相关属性的图片
      getProductSkuPic(name){
        for(let i=0;i<newValues.value.skuStockList.length;i++){
          let spData = JSON.parse(newValues.value.skuStockList[i].spData);
          if(name===spData[0].value){
            return newValues.value.skuStockList[i].pic;
          }
        }
        return null;
      },
      //合并商品属性
      mergeProductAttrValue() {
        newValues.value.productAttributeValueList = [];
        for (let i = 0; i < states.selectProductAttr.length; i++) {
          let attr = states.selectProductAttr[i];
          if (attr.handAddStatus === 1 && attr.options != null && attr.options.length > 0) {
            newValues.value.productAttributeValueList.push({
              productAttributeId: attr.id,
              value: methods.getOptionStr(attr.options)
            });
          }
        }
        for (let i = 0; i < states.selectProductParam.length; i++) {
          let param = states.selectProductParam[i];
          newValues.value.productAttributeValueList.push({
            productAttributeId: param.id,
            value: param.value
          });
        }
      },
      //合并商品属性图片
      mergeProductAttrPics() {
        for (let i = 0; i < states.selectProductAttrPics.length; i++) {
          for (let j = 0; j < newValues.value.skuStockList.length; j++) {
            let spData = JSON.parse(newValues.value.skuStockList[j].spData);
            if (spData[0].value === states.selectProductAttrPics[i].name) {
              newValues.value.skuStockList[j].pic = states.selectProductAttrPics[i].pic;
            }
          }
        }
      },
      getOptionStr(arr) {
        let str = '';
        for (let i = 0; i < arr.length; i++) {
          str += arr[i];
          if (i != arr.length - 1) {
            str += ',';
          }
        }
        return str;
      },
      handleRemoveProductSku(index,) {
        let list = newValues.value.skuStockList;
        if (list.length === 1) {
          list.pop();
        } else {
          list.splice(index, 1);
        }
      },
      getParamInputList(inputList) {
        return inputList.split(',');
      },
      handlePrev() {
        emit('prevStep')
      },
      handleNext() {
        methods.mergeProductAttrValue();
        methods.mergeProductAttrPics();
        emit('nextStep')
      }
    })
    const selectProductPics = computed({
      get:function () {
        let pics=[];
        if(newValues.value.pic===undefined||newValues.value.pic==null||newValues.value.pic===''){
          return pics;
        }
        pics.push(newValues.value.pic);
        if(newValues.value.albumPics===undefined||newValues.value.albumPics==null||newValues.value.albumPics===''){
          return pics;
        }
        let albumPics = newValues.value.albumPics.split(',');
        for(let i=0;i<albumPics.length;i++){
          pics.push(albumPics[i]);
        }
        return pics;
      },
      set:function (newValue) {
        if (newValue == null || newValue.length === 0) {
          newValues.value.pic = null;
          newValues.value.albumPics = null;
        } else {
          newValues.value.pic = newValue[0];
          newValues.value.albumPics = '';
          if (newValue.length > 1) {
            for (let i = 1; i < newValue.length; i++) {
              newValues.value.albumPics += newValue[i];
              if (i !== newValue.length - 1) {
                newValues.value.albumPics += ',';
              }
            }
          }
        }
      }
    })
    
    watch(()=>productId.value, (newValue)=>{
      if(!isEdit)return;
        if(states.hasEditCreated)return;
        if(newValue===undefined||newValue==null||newValue===0)return;
        methods.handleEditCreated();
    })
    onMounted(()=>{
      methods.getProductAttrCateList()
    })
    return {
      newValues,
      productId,
      hasAttrPic,
      selectProductPics,
      ...states,
      ...methods
    }
  },
})
</script>

<style scoped>
.littleMarginLeft {
    margin-left: 10px;
  }

  .littleMarginTop {
    margin-top: 10px;
  }

  .paramInput {
    width: 250px;
  }

  .paramInputLabel {
    display: inline-block;
    width: 100px;
    text-align: right;
    padding-right: 10px
  }

  .cardBg {
    background: #F8F9FC;
  }
</style>
