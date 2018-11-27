var app = angular.module('app', ['angularFileUpload'])
.config(["$httpProvider", function ($httpProvider) {
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
}])
.controller('myController', function ($scope, $http, $upload) {
	$scope.url = 'http://ehospital.eureka-health.com:8092/';
	$scope.releseUrl = 'http://106.14.132.32/';
	$scope.resource = 'http://ehospital.eureka-health.com:8092/resource/';
	var releseResource = 'http://106.14.132.32/resource/';
	$scope.condition = 0;
	$scope.tinnitusType = '0';
	$scope.createEditor = function (id) {
		$(id).ace_wysiwyg({
			toolbar: [
				'font',
				null,
				'fontSize',
				null,
				{
					name: 'bold',
					className: 'btn-info'
				}, {
					name: 'italic',
					className: 'btn-info'
				}, {
					name: 'strikethrough',
					className: 'btn-info'
				}, {
					name: 'underline',
					className: 'btn-info'
				},
				null,
				{
					name: 'insertunorderedlist',
					className: 'btn-success'
				}, {
					name: 'insertorderedlist',
					className: 'btn-success'
				}, {
					name: 'outdent',
					className: 'btn-purple'
				}, {
					name: 'indent',
					className: 'btn-purple'
				},
				null,
				{
					name: 'justifyleft',
					className: 'btn-primary'
				}, {
					name: 'justifycenter',
					className: 'btn-primary'
				}, {
					name: 'justifyright',
					className: 'btn-primary'
				}, {
					name: 'justifyfull',
					className: 'btn-inverse'
				},
				
				null,
				{
					name: 'insertImage',
					className: 'btn-success'
				},
				null,
				'foreColor',
			]
		}).prev().addClass('wysiwyg-style2');
	};
	$scope.$watch('tinnitusType',function(val){
		if(val === "1"){
			$scope.showImgBox = true;
			
		}else {
			$scope.showImgBox = false;
		}
	},false);
	$scope.login = function () {
		$scope.isLogin = true;
		if ($scope.condition) {
			$scope.url = $scope.releseUrl;
			$scope.resource = releseResource;
		}
		var params = {
			"Header": {
				"TimeStamp": "1517277442270"
			},
			"Body": {
				"PhoneNum": $scope.PhoneNum,
				"Password": $scope.Password,
				"Channel": 2
			}
		};
		
		var address = $scope.url + 'user/manager/login';
		$http.post(address, params).success(function (response) {
			if (response.Header.StatusCode === 0) {
				$scope.token = response.Header.Token;
				$("#login_wrap").hide();
				$("#editor_wrap").show();
				$scope.createEditor("#edit");
			} else {
				$scope.isLogin = false;
				alert(response.Header.Message);
			}
		}).error(function (error) {
			console.log(error)
			$scope.isLogin = false;
			alert("登陆失败");
		});
	};
	
	$scope.fReleseClickButton = function () {
		$scope.content = $("#edit").html();
		if (!$scope.title) {
			alert('请输入标题！');
			return;
		}
		if (!$scope.content) {
			alert('请输入内容！');
			return;
		}
		if($scope.tinnitusType === "0"){
			if (!$scope.iconUrl) {
				alert('请上传缩略图标！');
				return;
			}
		}
		
		if($scope.tinnitusType === "1"){
			$scope.iconUrl = null;
		}
		
		var address = $scope.url + '/api/document/AddDocument';
		var params = {
			"Header": {
				"Token": $scope.token
			},
			"Body": {
				"Title": $scope.title,
				"Author": $scope.author,
				"ArticleContent": $scope.content,
				"Icon": $scope.iconUrl,
				"ShortId": $scope.ShortId,
				"Type": $scope.tinnitusType
			}
		};
		$http.post(address, params).success(function (response) {
			if(response.Header.StatusCode === 0){
				alert('文章上传成功');
			}else{
				alert(response.Header.Message)
			}
		}).error(function (error) {
			alert(error);
		})
	};
	
	window.getImgUrl = function (file, callback) {
		$upload.upload({
			url: $scope.url + 'api/Upload/upload',
			file: file[0],
			data: {
				token: $scope.token,
				FileType  :'3'
			}
		}).progress(function (evt) {
			var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
			console.log(progressPercentage);
		}).success(function (data) {
			console.log(data);
			var fileUrl = $scope.resource + data.Body[0].Url;
			callback(fileUrl);
		}).error(function (data) {
			alert(data);
		});
	};
	
	$("#upload_input").change(function () {
		var file = $("#upload_input")[0].files;
		$upload.upload({
			url: $scope.url + 'api/Upload/upload',
			file: file[0],
			data: {
				token: $scope.token,
				FileType:'2'
			}
		}).progress(function (evt) {
			var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
			console.log(progressPercentage);
		}).success(function (data) {
			$scope.iconUrl = data.Body[0].Url;
			$scope.urlImg = $scope.resource + data.Body[0].Url;
			$("#upload_icon").css("background-image", "url(" + $scope.urlImg + ")");
		}).error(function (data) {
			alert(data);
		});
	})
});
window.onbeforeunload = function () {
	return "请确认信息是否已保存！";
};