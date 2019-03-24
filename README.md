# list-template-js
리스트화면 개발 시 중복되는 로직을 모아 처리하는 유틸리티 객체입니다.
```
new ListTemplate(PolicyList.init());
```
주로 중복되는 이벤트는 다음과 같습니다.
- 검색버튼 클릭 이벤트
- 초기화버튼 클릭 이벤트
- 정렬버튼 클릭 이벤트
- 엑셀 다운로드버튼 클릭 이벤트
- ...

다음과 같이 선언하여 사용할 수 있습니다.
공통이벤트는 내부에 처리되어 있으므로 변하는 부분만 세팅하면 됩니다.
```
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
	  xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
	  layout:decorate="layouts/main">
<head>
	<script type="text/javascript" src="/js/template/v1.0/base/ListTemplate.js?v=1.0" th:src="@{/js/template/v1.0/base/ListTemplate.js?v=1.2}"></script>
</head>
<body>
<!-- contentArea -->
</body>

<script layout:fragment="mainScript" th:inline="javascript">
    $(function(){
        /*
        * 검색박스 + 결과테이블 컴포넌트 단위가 됩니다
        * */
        var PolicyList = {
            /*
            * Selector 세팅
            *
            * default값을 사용한다면 수정할 필요 없음
            * 필요에 따라 customizing 가능
            * */
            selectors : {
                rootContextSelector		  			: "#rootContext"
                ,dateSearchTypeSelector  			: "#dateSearchType"
                ,startDateSelector       			: "#startDate"
                ,endDateSelector         			: "#endDate"
                ,dateButtonAreaSelector  			: "#dateButtonArea"
                ,divDataSelector         			: "#divData"
                ,divDataTobodySelector              : "#divData tbody"
                ,btnClearSelector        			: "#btnClear"
                ,btnSearchSelector       			: "#btnSearch"
                ,searchTypeSelector      			: "#searchType"
                ,searchTextSelector      			: "#searchValue"
                ,pageNumSelector         			: "#pageNum"
                ,pageSizeSelector        			: "#pageSize"
                ,pageSizeSelectSelector    			: "#pageSizeSelect"
                ,pageSortColumnSelector    			: "#pageSortColumn"
                ,pageSortOrderSelector    			: "#pageSortOrder"
                ,autoSearchYnSelector    			: "#autoSearchYn"
                ,maskYnSelector    					: "#maskYn"
                ,pageUseYnSelector    				: "#pageUseYn"
                ,maskingSelector    				: "#masking"
                ,btnDownloadSelector     			: "#btnDown"
                ,pagingTopSelector       			: "#pagingTop"
                ,pagingBottomSelector    			: "#pagingBottom"
                ,basePagingParameterSelector	    : "#basePagingParameter"
                ,searchBoxSearchParameterSelector	: "#searchBoxSearchParameter"
            }
            /*
            * 정렬기준 기본 값
            *
            * 테이블 정렬이 필요한 화면에서는 꼭 디폴트 값이 필요하다.
            * 각 API, DAO에 맞게 sortColumn과 sortOrder를 세팅한다.
            *
            * useSorting : true | false
            * useSorting : true
            *       sortColumn, sortOrder : 정렬컬럼과 정렬방식을 세팅해준다.
            * */
            ,defaultPagingParameter : {
                useSorting : true
                ,sortColumn : "updatedTime"
                ,sortOrder : "desc"
            }
            /*
            * 테이블 관련 정보
            *
            * columnSize : table 컬럼개수
            * */
            ,tableInfo : {
                columnSize : 7
            }
            /*
            * 검색조건 초기화
            *
            * 검색조건 초기화 버튼 눌렀을 때 실행되어야 하는 로직 작성
            * (달력 초기화 등 기본적인 작업은 내부로직에 있음)
            *
            * preExecute : commonExecute를 실행하기 이전에 실행되어야 하는 작업
            * postExecute : commonExecute를 실행한 후 실행되어야 하는 작업
            * */
            ,getInitializeSearchConditionFunctions : function() {
                return {
                    preExecute : function() {
                        console.log("reset search condition preExecute");
                        PolicyList.$searchBoxSearchParameter[0].reset();
                        PolicyList.$searchType.val("POLICY_NAME").prop("selected", true).trigger('chosen:updated');
                        PolicyList.$searchText.val("");
                        var konaAspNo4 = /*[[${@environment.getProperty('serviceportal.kona.asp.no')}]]*/;
                        CommonJs.selectVal(PolicyList.$aspNo, konaAspNo4);
                    }
                    ,postExecute : function() {
                        console.log("reset search condition postExecute");
                    }
                };
            }
            /*
            * 검색조건 인스턴스 만들기
            *
            * 컨트롤러로 넘어가는 Parameter를 객체형태로 만드는 로직을 작성한다
            * baseSearchParameter : 검색박스의 default 내용은 여기에 내려옴
            * */
            ,getCustomSearchParameterForm : function(baseSearchParameter) {
                baseSearchParameter.aspId = $('#aspNo option:selected').data('konaCd');
                baseSearchParameter.searchType = PolicyList.$searchType.val();
                baseSearchParameter.dateSearchType = "UPDATED_TIME";
                baseSearchParameter.pageSortOrder = baseSearchParameter.pageSortOrder.toLowerCase();
                return baseSearchParameter;
            }
            /*
            * 엑셀 다운로드 로직 작성
            *
            * successFunction : fetch 성공 시 로직 작성
            * errorFunction : fetch 실패 시 로직 작성
            * */
            ,getExcelDownloadFetchInfo : function() {
                var searchParameter = PolicyList.getSearchParameterForm();
                return {
                    url : "/partner/excelDownload"
                    ,method : "POST"
                    ,returnType : "blob"
                    ,body : JSON.stringify(searchParameter)
                    ,isValidFunction : function() {
                        if(CommonJs.isNull(searchParameter)) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    ,successFunction : function(response) {
                        var url = window.URL.createObjectURL(data);
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = "???.xlsx";
                        a.click();
                    }
                    ,errorFunction : function(response) {
                        ModalJs.alert(response);
                    }
                }
            }
            /*
            * fetch 로직
            *
            * searchList는 ListTemplate.js 내부에서 호출해주는 함수입니다.
            *
            * */
            ,searchList : function() {
                var searchParameter = PolicyList.getSearchParameterForm();
                FetchJs.fetch({
                    url : "/cardpoint/policy/fetch/get/list?"+$.param(searchParameter),
                    method : "GET",
                    returnType : "json"
                }).then(function(response) {//success

                    // console.log("request", searchParameter);
                    // console.log("response", response);
                    var totalCnt = CommonJs.nullToEmpty(response.data.totalCnt, '0');
                    var contentList = response.data.contents.contents;

                    // 이거 실행하면 getHtml함수를 호출함
                    PolicyList.setList(totalCnt, contentList);

                }, function(error) {//fail
                    ModalJs.alert(error);
                    PolicyList.$divDataTbody.html(PortalUiDrawer.getEmptyListToHtmlTag(PolicyList.tableInfo.columnSize, /*[[${#messages.msg('T_0505')}]]*/));
                    PolicyList.$pagingTop.find("strong").text(0);
                    PolicyList.$pagingBottom.empty();
                });
            }
            ,getHtml : function(idx, data) {

                // logic...

                var innerHtml = "";
                innerHtml += "<tr style='cursor: pointer;' class='goPolicyView' data-id='"+data.id+"'>";
                innerHtml += "		<td>"+idx+"</td>";
                innerHtml += "		<td>"+CommonJs.nullToEmpty(data.aspName, '-')+"</td>";
                innerHtml += "		<td>"+CommonJs.nullToEmpty(data.name, '-')+"</td>";
                innerHtml += "		<td>"+CommonJs.nullToEmpty(data.expiryPeriod, '-')+"</td>";
                innerHtml += "		<td>"+maxPossessionLimit+"</td>";
                innerHtml += "		<td>"+CommonJs.nullToEmpty(minConditionAmt, '-')+"</td>";
                innerHtml += "		<td>"+CommonJs.nullToEmpty(data.updatedTime, '')+"</td>";
                innerHtml += "</tr>";
                return innerHtml;
            }
            ,initialize : function() {
                PolicyList.$divData.tableSort({
                    sortList : [
                        {
                            tableIndex : 6
                            ,tableColumn : "updatedTime"
                        }
                    ]
                    ,searchFunction : $.goPage
                });
            }
            ,init : function() {
                this.cache();
                this.bindEvent();
                return this;
            }
            ,cache : function() {
                this.$aspNo = $('#aspNo');
            }
            ,bindEvent : function() {

                var $document = $(document);

				/*
				* 팝업 한번에 붙여넣기
				*
				* body안에 div선언하지 않고 바로 document에 만들어서 붙이고,
				* 거기에 바로 load작업 진행하여 코드를 한 묶음으로 관리할 수 있습니다! :)
				* */
                if($('.onClickBizTypeGroupPopup').length) {
                    var bizTypeGroupSearchModal = $('<div id="bizTypeGroupSearch"/>');
                    bizTypeGroupSearchModal.load("/biztype/popup/groupList", function() {
                        $document.find('body').append(bizTypeGroupSearchModal);
                    });

                    $document.on('click', '.onClickBizTypeGroupPopup', function() {
						BizTypeGroupList.callModal(
							function bizTypeGroupPopupCloseCallback(paramFromClosePopup) {
								var $bizTypeGrpName = $('[name="bizTypeGroupName"]');
								var $bizTypeGrpId = $('[name="bizTypeGrpId"]');
								if(CommonJs.isNull(paramFromClosePopup.bizTypeGroupInfo)) {
									$bizTypeGrpName.val(null);
									$bizTypeGrpId.val(null);
								} else {
									var bizTypeGroupId = paramFromClosePopup.bizTypeGroupInfo.grpId;
									var bizTypeGroupName = paramFromClosePopup.bizTypeGroupInfo.grpName;
									var bizTypeGroupCount = paramFromClosePopup.bizTypeGroupInfo.bizTypeCount;
									$bizTypeGrpName.val(bizTypeGroupName + " / " + bizTypeGroupCount);
									$bizTypeGrpId.val(bizTypeGroupId);
								}
							},
							$(this).closest('span')
						);
                    });
                }
            }
        };

        window.PolicyList = new ListTemplate(PolicyList.init());
        // window.ProductList = new ListTemplate(ProductList.init()); // 두개 선언하면 한 화면에 두 개 그릴 수 있음

        $(document)
            .on('click', 'tr.goPolicyView', function(event) {
                var id = $(event.currentTarget).data("id");
                if(!CommonJs.isNull(id)) {
                    location.href = "/cardpoint/policyView?id=" + id;
                }
            })
        ;
    });

</script>
</html>

```
