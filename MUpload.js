$.fn.MUpload  = function(options){

    var file_name = options.file_name;  //文件控件名称

    var upload_url = options.upload_url; //文件上传路径

    var data_type = options.data_type; //返回数据类型

   var is_html5 = (typeof(Worker) !== "undefined") ?true:false;      //是否支持html5

    var if_time = 0;                   //表单提交iframe时间

    var that = this; 

    var $form = null;                   

    /**
     * 创建上传表单
     */
    this.create_form = function (file_name) {

        if (is_html5) {

             $form = $('<form class="MUpload" style="display: none" enctype="multipart/form-data">' +
                '<input type="file" style="display: none" name="' + file_name + '" id="' + file_name + '">' +
                '</form>');

            $form.appendTo($("body"));

        }else{

             $form = $('<iframe class="MIframe" name="MIframe" id="MIframe"  frameborder=0 width=0 height=0></iframe><form class="MUpload" target="MIframe" style="display: none"  method="post" action='+upload_url+' enctype="multipart/form-data">' +
                '<input type="file" style="display: none" name="' + file_name + '" id="' + file_name + '">' +
                '<input type="submit" id="MUpload_submit">' +
                '</form>');

            $form.appendTo($("body"));

        }
    };

    /**
     * 第一步执行创建表单
     */
    this.create_form(file_name);

    /**
     *点击文件事件
     */
    this.on('click',function () {

       $form.find("#"+file_name).click();

    });

   /**
     *图片控件上传事件
     */
    $form.on('change','#'+file_name,function(){
            
     if($(this).val() == ''){
                return that.errormsg(-2);
     } 

     if(is_html5){

            var formData = new FormData($(document).find(".MUpload")[0]);

            $.ajax({
                url: upload_url,
                type: 'POST',
                cache: false,
                data: formData,
                dataType: data_type,
                processData: false,
                contentType: false
            }).done(function(data) {
                
                 options.success(data);

            }).fail(function(res) {
                    that.errormsg();
            });

        }else{

             $('.MUpload').submit();

             if_time = 0;

             var timeSet = setInterval(function(){

                    if_time++ ;

                    var iframeObj = $(window.frames["MIframe"].document); 

                    var html = iframeObj.find("body").html();

                    if(html != '' && if_time<5){

                           try { 

                                    if(data_type == 'text'){

                                          options.success(html);

                                    }else if(data_type == 'json'){

                                        var reg = /<pre.+?>(.+)<\/pre>/g;  

                                        var result = html.match(reg);  

                                        html = RegExp.$1;

                                        var data = JSON.parse(html);

                                        options.success(data);

                                    }

                                    clearInterval(timeSet);

                           　} catch(error) {

                                       clearInterval(timeSet);

                                       return that.errormsg(-3);
                               } 

                    }else{

                         clearInterval(timeSet);

                         return that.errormsg();
                    }

            },1000);

        }
    });


    /**
     *上传失败消息
     */
    this.errormsg = function(errorno=-1){

            var errormsg_arr = new Array();


            errormsg_arr[-1] ={
                    errormsg:'上传失败',
            };

            errormsg_arr[-2] ={
                    errormsg:'上传文件没有选择',
            };

             errormsg_arr[-3] ={
                    errormsg:'返回数据格式不正确',
            };

            options.error( errormsg_arr[errorno]);

    }

}