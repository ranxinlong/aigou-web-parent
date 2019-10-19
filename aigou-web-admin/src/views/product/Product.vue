<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getProduct">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleViewProperties">显示属性</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSkuProperties">SKU属性</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleOnSale">上架</el-button>
				</el-form-item><el-form-item>
					<el-button type="primary" @click="handleOffSale">下架</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="Product" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="标题" width="180" sortable>
			</el-table-column>
			<el-table-column prop="subName" label="副标题" width="120" sortable>
			</el-table-column>
			<el-table-column prop="productType.name" label="商品类型" width="120" sortable>
			</el-table-column>
			<el-table-column prop="brand.name" label="品牌" width="90" sortable>
			</el-table-column>
			<el-table-column prop="onSaleTime" label="上架时间" width="140" sortable
			:formatter = "formonSaleTime">
			</el-table-column>
			<el-table-column prop="offSaleTime" label="下架时间" width="140" sortable
			:formatter = "formoffSaleTime">
			</el-table-column>
			<el-table-column prop="state" label="状态" min-width="100" sortable>
				<template scope="scope">
					<span style="color: darkgreen;size: A3" v-if="scope.row.state == 1">上架</span>
					<span style="color: red" v-else>下架</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" @click="loadextData(scope.$index, scope.row),handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="rows" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="标题" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="副标题" prop="subName">
					<el-input v-model="editForm.subName" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="商品类型" prop="productTypeId">
					<el-cascader
							:change-on-select="true"
							:props="defaultParams"
							placeholder='请选择商品类型'
							:options="options"
							v-model="selectedOptions2"
							:clearable="true">
					</el-cascader>
				</el-form-item>
				<el-form-item label="品牌">
					<el-select v-model="editForm.brandId" filterable placeholder="请选择品牌">
						<el-option
								v-for="item in brands"
								:label="item.name"
								:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="商品描述">
					<el-input  type="textarea" v-model="editForm.ext.description" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="媒体属性" >
					<!--<el-input v-model="addForm.medias" auto-complete="off"></el-input>-->
					<el-upload
							class="upload-demo"
							action="http://127.0.0.1:6969/services/common/file"
							:on-preview="handlePreview"
							:on-remove="handleRemove"
							:before-upload="beforeupload"
							:on-success="handonsucess"
							:file-list="fileList"
							list-type="picture">
						<el-button size="small" type="primary" style="width: 200px">点击上传品牌logo</el-button>
					</el-upload>


				</el-form-item>
				<el-form-item label="商品详情">
					<!--<el-input v-model="addForm.ext.richContent" auto-complete="off"></el-input>-->
					<quill-editor
							v-model="editForm.ext.richContent"
							ref="myQuillEditor">
					</quill-editor>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="标题" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="副标题" prop="subName">
					<el-input v-model="addForm.subName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="商品类型" prop="productTypeId">
					<el-cascader
							:change-on-select="true"
							:props="defaultParams"
							placeholder='请选择商品类型'
							:options="options"
							v-model="addForm.productTypeId"
							:clearable="true">
					</el-cascader>
				</el-form-item>
				<el-form-item label="品牌">
					<el-select v-model="addForm.brandId" filterable placeholder="请选择品牌">
						<el-option
								v-for="item in brands"
								:label="item.name"
								:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="商品描述">
					<el-input  type="textarea" v-model="addForm.ext.description" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="媒体属性" >
					<!--<el-input v-model="addForm.medias" auto-complete="off"></el-input>-->
					<el-upload
							class="upload-demo"
							action="http://127.0.0.1:6969/services/common/file"
							:on-preview="handlePreview"
							:on-remove="handleRemove"
							:before-upload="beforeupload"
							:on-success="handonsucess"
							:file-list="fileList"
							list-type="picture">
						<el-button size="small" type="primary" style="width: 200px">点击上传品牌logo</el-button>
					</el-upload>
				</el-form-item>
				<el-form-item label="商品详情">
					<!--<el-input v-model="addForm.ext.richContent" auto-complete="off"></el-input>-->
					<quill-editor
							v-model="addForm.ext.richContent"
							ref="myQuillEditor">
					</quill-editor>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

		<el-dialog title="显示属性" v-model="handleViewFormVisible" :close-on-click-modal="false">
			<el-form label-width="80px" style="margin-left: -20px">
				<el-form-item v-for="viewProperty in viewProperties">
					<el-row>
						<el-col :span="4">
							{{viewProperty.specName}}：
						</el-col>
						<el-col :span="20">
							<el-input v-model="viewProperty.value" auto-complete="off"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="handleViewFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="handleViewSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>


		<el-dialog title="SKU属性" v-model="handleSkuFormVisible" :close-on-click-modal="false">
			<!--(SkuProperty,i)  在for循环的同时，可以把当前数据的下标循环出来-->
			<el-card class="box-card" v-for="(SkuProperty,i) in SkuProperties">
				<div slot="header" class="clearfix">
					<span style="line-height: 36px;">{{SkuProperty.specName}}</span>
				</div>
				<div v-for="index in SkuProperty.options.length + 1 " class="text item">
					<el-row>
						<el-col :span="20">
							<el-input v-model="SkuProperty.options[index - 1]" auto-complete="off"></el-input>
						</el-col>
						<el-col :span="4">
							<el-button type="primary" icon="delete" @click="removeProperTy(i,index-1)"></el-button>
						</el-col>
					</el-row>
				</div>
			</el-card>
			<el-table :data="skus"style="width: 100%;">
				<el-table-column v-for="(value,key) in skus[0]" :label="key" :prop="key">
				</el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="handleSkuFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="handleSkuSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>

	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

	export default {
		data() {
			return {

			    //SKU弹窗里面的table表格
			    skus:[],

                SkuProperties:[],
			    //SKU属性的弹窗
                handleSkuFormVisible:false,
                viewProperties:[],
			    //显示属性弹窗
                handleViewFormVisible:false,
			    //存放编辑页面新上传的图片；
                imgNewPath:[],
			    //存放修改图片时已有图片的保存位置
                imgOriginalPath:[],
                selectedOptions2: [],
                fileList: [],
                brands:[],
                options: [],
			    /*商品类型的匹配数据*/
                defaultParams: {
                    label: 'name',
                    value: 'id',
                    children: 'children'
                },
				filters: {
					name: ''
				},
				Product: [],
				total: 0,
				page: 1,
                rows:10,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入标题', trigger: 'blur' }
					],
                    subName: [
                        { required: true, message: '请输入副标题', trigger: 'blur' }
                    ]
				},
				//编辑界面数据
				editForm: {
                    name: '',
                    subName:'',
                    productTypeId:'',
                    brandId:'',
                    medias:'',
                    ext: {
                        description:'',
                        richContent:'',
                    }
				},
				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入标题', trigger: 'blur' }
					],
                    subName: [
                        { required: true, message: '请输入副标题', trigger: 'blur' }
                    ]
				},
				//新增界面数据
				addForm: {
					name: '',
                    subName:'',
                    productTypeId:'',
                    brandId:'',
                    medias:'',
                    ext: {
                        description:'',
                        richContent:'',
					}
				}
			}
		},
		methods: {
            removeProperTy(index1,index2){
                //index1 第几个SKU属性
				//index 当前SKU属性的第几个值
				//这句话的解析：找到第index1的SkuProperties下的SKU属性下的options，并删除options数组里面下标是index2长度为1的数据
                this.SkuProperties[index1].options.splice(index2,1);
			},
		    /*商品的显示属性保存*/
            handleViewSubmit(){
                let productId = this.sels[0].id;
                this.$confirm('确认保存吗？', '提示', {}).then(() => {
                    this.addLoading = true;
                    //NProgress.start();
                    this.$http.post("/product/product/saveViewProperties?productId="+productId,this.viewProperties).then(res=>{
                        let {success,message,restObj} = res.data;
                        if(success){
                            this.addLoading = false;
                            //NProgress.done();
                            this.$message({
                                message: '操作成功',
                                type: 'success'
                            });
                            this.handleViewFormVisible = false;
                            this.viewProperties=[];
                        }else{
                            this.$message({
                                message: '操作失败',
                                type: 'error'
                            });
                        }
                    }).catch({

                    });
                });
			},
            /*编辑室获取回填菜单*/
            loadGetPath(index, row){
                this.$http.get("/product/productType/"+row.productTypeId).then(res=>{
                    var selectedOptions = res.data.path.split('.');
                    let paths = [];
                    let indexs ='';
                    for (let index = 0 ; index < selectedOptions.length ; index++){
                        if (selectedOptions[index] != ''){
                            indexs = parseInt(selectedOptions[index]);
                            paths.push(indexs);
                        }
                    }
                    this.selectedOptions2 = paths;
                }).catch({});
            },
            handlePreview(){},
            beforeupload(){},
            /*删除已经上传了的图片*/
            handleRemove(file, fileList) {
                let FileId = '';
                if(file.size){
                    FileId = file.response.restObj;

                }else {

                    FileId = file.url.slice(19);

                }
                //删除图片的时候，把newImgPath数组里面的值向对应的删除
                this.imgNewPath.splice(this.imgNewPath.indexOf(FileId),1);
                //删除服务器图片的同时，把我们保持原始数据的路径一并删除
                this.imgOriginalPath.splice(this.imgOriginalPath.indexOf(FileId),1);
                this.$http.delete("/common/file?FileId="+FileId).then(res=>{
                    /*if (res.data.success){
                        this.fileList=[];
                    }*/
                }).catch({})
            },
		    loadextData(index,row){
		       this.$http.get("/product/productExt/findOne?productId="+row.id).then(res=>{
		            // this.editForm.ext.description = res.data.description;
		            // this.editForm.ext.richContent = res.data.richContent;
		            this.editForm.ext = res.data;
				}).catch({});
			},
            handonsucess(response, file, fileList){
                let{message,restObj,success} = response;
                if (success){
                    this.$message({
                        message: '上传成功',
                        type: 'success'
                    });
                    //新上传图片的时候，把新上传图片保存路径加入数组里面
                    this.imgNewPath.push(restObj);
                    this.fileList = fileList;
                }else{
                    this.$message({
                        message: message,
                        type: 'error'
                    });
                }
            },
            getBrands(){
                this.$http.get("/product/brand/list").then(res=>{
                    this.brands = res.data;
				}).catch();
			},
		    /*获取类型菜单*/
            loadTypeTree(){
                this.$http.get("/product/productType/loadTypeTree").then(res=>{
                    this.options = this.getTreeData(res.data);
                }).catch({});
            },
            // 递归方法:去掉tree里面的空数组
            getTreeData(data) {
                // 循环遍历json数据
                for (var i = 0; i < data.length; i++) {

                    if (data[i].children.length < 1) {
                        // children若为空数组，则将children设为undefined
                        data[i].children = undefined;
                    } else {
                        // children若不为空数组，则继续 递归调用 本方法
                        this.getTreeData(data[i].children);
                    }
                }
                return data;
            },
            handleViewProperties(){
                if (this.sels.length == 0){
                    this.$message({
                        message: '请选择数据',
                        type: 'warning'
                    });
                    return;
				}
                if (this.sels.length >1){
                    this.$message({
                        message: '只能选择一行数据',
                        type: 'warning'
                    });
                    return;
                }
                let productId = this.sels[0].id;
                this.$http.get("/product/product/getviewProperties/"+productId).then(res=>{
                    console.debug(res.data);
                    this.viewProperties = res.data;
				}).catch({});
                this.handleViewFormVisible = true;
			},
            handleSkuProperties(){
                if (this.sels.length == 0){
                    this.$message({
                        message: '请选择数据',
                        type: 'warning'
                    });
                    return;
                }
                if (this.sels.length >1){
                    this.$message({
                        message: '只能选择一行数据',
                        type: 'warning'
                    });
                    return;
                }
                let productId = this.sels[0].id;
                this.$http.get("/product/product/getskuProperties/"+productId).then(res=>{
                    this.SkuProperties = res.data;
                }).catch({});
                this.handleSkuFormVisible = true;
            },
            handleOnSale(){
                alert("上架");
            },
            handleOffSale(){
                alert("下架");
            },

            formonSaleTime(row,column){
               return this.formtTime(row.onSaleTime)
			},
            formoffSaleTime(row,column){
                return this.formtTime(row.offSaleTime)
			},
			//格式化时间的方法
			formtTime(time){
                if(time == null){
                    return null;
				}
				let date = new Date(time);
                let year = date.getFullYear();
				let month = date.getMonth()+1;
				let day = date.getDay();
				let hours = date.getHours();
				let min = date.getMinutes();
				let seconds = date.getSeconds();
				let times = year +'-'+this.formTimeBum(month) +'-'+this.formTimeBum(day)
                +' '+this.formTimeBum(hours)+':'+this.formTimeBum(min)+':'+this.formTimeBum(seconds);
				return times
			},
			formTimeBum(num){
                if (num < 10){
                    return "0" + num;
				}else{
                    return num;
				}
			},
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getProduct();
			},
			//获取商品列表
			getProduct() {
				let para = {
					page: this.page,
					rows:this.rows,
                    keyword:this.filters.name,
					/*name: this.filters.name*/
				};
				this.listLoading = true;
				this.$http.post("/product/product/json",para).then(res=>{
				    this.listLoading = false;
                    let{total,rows} = res.data;
                    this.total = total;
                    this.Product = rows;
				}).catch({});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
                    this.$http.delete("/product/product/delete/"+row.id).then(res=>{
                        this.listLoading = false;
                        let{success,message,restObj} = res.data;
                        if (success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getProduct();
                        }else{
                            this.$message({
                                message: '删除失败',
                                type: 'error'
                            });
                        }
                    });
                    this.$http.delete("/common/file?FileId="+row.logo).then(res=>{
                    }).catch({});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
                this.fileList=[];
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
                this.loadGetPath(index, row);
                this.fileList=[];
                if(row.medias){
                   let arr =  row.medias.split(",");
                   for (var index = 0;index < arr.length;index++){
                       this.fileList.push({"url":"http://172.16.4.128"+arr[index]});
                       this.imgOriginalPath.push(arr[index]);
				   }
				}
			},
			//显示新增界面
			handleAdd: function () {
                this.fileList =[];
				this.addFormVisible = true;
				this.addForm = {
                    name: '',
                    subName:'',
                    productTypeId:[],
                    brandId:'',
                    medias:'',
                    ext: {
                        description:'',
                        richContent:'',
                    }
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
                            for(var i = 0;i<this.selectedOptions2.length ; i++){
                                var b = this.selectedOptions2[i];
                            }
                            para.productTypeId = b;
                            para.medias =  this.imgNewPath.concat(this.imgOriginalPath).join(",")
							//原有的数据已经用一个新数组接收了，现在需要把新添加的图片地址用了新的保存了
                            //para.medias = this.imgNewPath.join(",");
                            console.debug(para.medias);
                            this.$http.post("/product/product/add",para).then(
                                res=>{
                                    let {success,message,restObj} = res.data;
                                    if(success){
                                        this.addLoading = false;
                                        this.$message({
                                            message: '修改成功',
                                            type: 'success'
                                        });
                                        this.$refs['editForm'].resetFields();
                                        this.editFormVisible = false;
                                        this.editLoading = false;
                                        this.getProduct();
                                    }else{
                                        this.$message({
                                            message: '修改失败',
                                            type: 'error'
                                        });
                                    }
                                }
                            ).catch({

                            });



						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
                            for(var i = 0;i<this.addForm.productTypeId.length ; i++){
                                var b = this.addForm.productTypeId[i];
                            }
                            para.productTypeId = b;
                            para.medias = this.fileList.map(file=>file.response.restObj).join(",");
							this.$http.post("/product/product/add",para).then(res=>{
                                let {success,message,restObj} = res.data;
                                if(success){
                                    this.addLoading = false;
                                    //NProgress.done();
                                    this.$message({
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                    this.$refs['addForm'].resetFields();
                                    this.addFormVisible = false;
                                    this.fileList = [];
                                    this.getProduct();
                                }else{
                                    this.$message({
                                        message: '添加失败',
                                        type: 'error'
                                    });
                                }
							}).catch({

							});



                            /*addUser(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getProduct();
                            });*/
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$http.delete("/product/product/deleteBatch?ids="+ids).then(res=>{
                    this.listLoading = false;
                    let{success,message,restObj} = res.data;
                    if (success){
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getProduct();
                    }else{
                        this.$message({
                            message: '删除失败',
                            type: 'error'
                        });
                    }
                }).catch(() => {

                });
            }
        },
		mounted() {
			this.getProduct();
			this.loadTypeTree();
			this.getBrands();
		},
		//watch是ES6的一个监听器
		watch:{
		  SkuProperties:{
		   handler(val,oldval){
		       //filter是一个过滤器，过滤掉sku里面的options为空的数组
		     let skuPropertiesArr = this.SkuProperties.filter(e=>e.options.length>0);
		     //es6的reduce方法 currentIndex 当前元素的索引
		     let result = skuPropertiesArr.reduce((pre,cur,currentIndex)=>{
		         //最开始：pre 是一个空的数组
				 //   cur={"specName":"年龄",options:["御姐","萝莉"]}
		         let map =[];
				 pre.forEach(e1=>{ //第一次循环：e1：{} 第二次循环 e1：{"年龄":"御姐"}
				     cur.options.forEach(e2=>{//e2:御姐 萝莉
				         let obj = Object.assign({},e1); //循环1,obj:{}
				         obj[cur.specName] = e2;//循环1：obj{"年龄":"御姐"}
						 //判断是不是最后的一次reduce
						 if (currentIndex == skuPropertiesArr.length -1 ){
						     obj.price = 0;
						     obj.store = 0;
						 }
				         map.push(obj); //map ：{"年龄":"御姐"}
					 })
				 })
				 return map;
			 },[{}])
			  this.skus = result;
		   },
			deep:true
			}
		}
	}

</script>

<style scoped>

</style>