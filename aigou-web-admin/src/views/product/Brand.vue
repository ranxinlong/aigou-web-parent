<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.name" placeholder="关键字" clearable></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getbrands" >查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="brands" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="商品名称" width="120" sortable>
            </el-table-column>
            <el-table-column prop="englishName" label="英文名称" width="120" sortable>
            </el-table-column>
            <el-table-column prop="firstLetter" label="首写字母" width="120" sortable>
            </el-table-column>
            <el-table-column prop="logo" label="品牌logo" width="120" sortable>
                <template scope="scope">
                    <!--scope.row.logo-->
                    <img :src="'http://172.16.4.128'+ scope.row.logo" height="50px" style="margin-top: 6px">
                </template>
            </el-table-column>
            <el-table-column prop="productType.name" label="商品类型" width="180" sortable>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="180" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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
                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="英文名称" prop="englishName">
                    <el-input v-model="editForm.englishName"></el-input>
                </el-form-item>
                <el-form-item label="品牌logo" prop="logo">
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
                <el-form-item label="商品类型">
                    <el-cascader
                            :props="defaultParams"
                                 :change-on-select="true"
                                 placeholder='请选择商品类型'
                                 :options="options"
                                 v-model="selectedOptions2"
                                 :clearable="true">
                    </el-cascader>
                </el-form-item>
                <el-form-item> </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="editForm.description"></el-input>
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
                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="英文名称" prop="englishName">
                    <el-input v-model="addForm.englishName"></el-input>
                </el-form-item>

                <el-form-item label="品牌logo" prop="logo">
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
                <el-form-item label="商品类型" prop="productTypeId">
                    <el-cascader
                                 @change="handleChange"
                                 :change-on-select="true"
                                 :props="defaultParams"
                                 placeholder='请选择商品类型'
                                 :options="options"
                                 v-model="addForm.productTypeId"
                                 :clearable="true">
                    </el-cascader>
                </el-form-item>

                <el-form-item> </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="addForm.description"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
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
                fileList: [],
                selectedOptions2: [],
                options: [],
               // selectedOptions: [],
                defaultParams: {
                    label: 'name',
                    value: 'id',
                    children: 'children'
                },
                filters: {
                    name: ''
                },
                brands: [],
                total: 0,
                page: 1,
                rows:10,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        { required: true, message: '请输入商品名', trigger: 'blur' }
                    ],
                    englishName:[
                        {required: true, message: '请输入英文名', trigger: 'blur' }
                    ]

                },
                //编辑界面数据
                editForm: {
                    name: '',
                    englishName:'',
                    firstLetter:'',
                    description: '',
                    productTypeId: [],
                    logo:''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        { required: true, message: '请输入商品名', trigger: 'blur' }
                    ],
                    englishName:[
                        { required: true, message: '请输入英文名', trigger: 'blur' }
                    ],
                    productTypeId:[
                        { required: true, message: '请选择商品类型', trigger: 'blur',type :'array'}
                    ]
                },
                //新增界面数据
                addForm: {
                    name: '',
                    englishName:'',
                    firstLetter:'',
                    description: '',
                    productTypeId: [],
                    logo:''
                }
            }
        },
        methods: {
            handonsucess(response, file, fileList){
                let{message,restObj,success} = response;
                if (success){
                    this.$message({
                        message: '上传成功',
                        type: 'success'
                    });
                    this.addForm.logo = restObj;
                    this.editForm.logo = restObj;
                }else{
                    this.$message({
                        message: message,
                        type: 'error'
                    });
                }
                this.fileList = fileList;
            },
            /*删除已经上传了的图片*/
            handleRemove(file, fileList) {
                let FileId = '';
                if(file.size){
                    FileId = file.response.restObj;
                }else {
                    FileId = file.url.slice(19);
                }
                this.$http.delete("/common/file?FileId="+FileId).then(res=>{
                    if (res.data.success){
                        this.fileList=[];
                    }
                }).catch({})
            },
            handlePreview(file) {
                console.log(file);
            },
            beforeupload(file){
                if(this.fileList.length > 0){
                    this.$message({
                        message: '只能上传一张logo！',
                        type: 'error'
                    });
                    return false;
                }
            },
            handleChange(value) {
                console.log(value);
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
            //性别显示转换
            formatSex: function (row, column) {
                return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getbrands();
            },
            //获取用户列表
            getbrands() {
                let para = {
                    page: this.page,
                    rows: this.rows,
                    keyword:this.filters.name,
                };
                this.listLoading = true;
                this.$http.post("/product/brand/json",para).then(res=>{
                    this.listLoading = false;
                    let{total,rows} = res.data;
                    this.total = total;
                    this.brands = rows;
                })
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    this.$http.delete("/product/brand/deleteBatch?ids="+row.id).then(res=>{
                        this.listLoading = false;
                        let{success,message,restObj} = res.data;
                        if (success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getbrands();
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
            handleEdit:function (index, row) {
                this.fileList = [];
                this.editFormVisible = true;
                this.editForm = Object.assign({}, row);
                this.loadGetPath(index, row)
                this.fileList.push({"url":"http://172.16.4.128"+this.editForm.logo});
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    name: '',
                    englishName:'',
                    firstLetter:'',
                    description: '',
                    productTypeId: [],
                    logo:''
                };
                this.fileList = [];
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            for(var i = 0;i<this.selectedOptions2.length ; i++){
                                var b = this.selectedOptions2[i];
                            }
                            para.productTypeId = b;
                            console.debug(para);
                            this.$http.post("/product/brand/add",para).then(
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
                                        this.getbrands();
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
                            this.$http.post("/product/brand/add",para).then(
                                res=>{
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
                                        this.getbrands();
                                    }else{
                                        this.$message({
                                            message: '添加失败',
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
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$http.delete("/product/brand/deleteBatch?ids="+ids).then(res=>{
                    this.listLoading = false;
                    let{success,message,restObj} = res.data;
                    if (success){
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getbrands();
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
            this.getbrands();
            this.loadTypeTree();
        }
    }

</script>

<style scoped>

</style>