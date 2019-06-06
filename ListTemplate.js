function ListTemplate(rootContext) {
    if(rootContext === undefined) {
        throw new Error("rootContext must not null");
    }
    if(rootContext.selectors === undefined) {
        throw new Error("rootContext.selectors must not null");
    }
    if(rootContext.selectors.contextName === undefined) {
        throw new Error("rootContext.selectors.contextName must not null");
    }
    if(rootContext.defaultPagingParameter === undefined) {
        throw new Error("Define defualtPagingParameter");
    }
    if(rootContext.defaultPagingParameter.useSorting === undefined) {
        throw new Error("Define defualtPagingParameter.useSorting");
    }
    if(rootContext.defaultPagingParameter.useSorting === true) {
        if(rootContext.defaultPagingParameter.sortOrder === undefined || rootContext.defaultPagingParameter.sortColumn === undefined) {
            throw new Error("Define defualtPagingParameter.sortOrder, defaultPagingParameter.sortColumn");
        }
    }
    if(CommonJs.isNull(rootContext.tableInfo) || CommonJs.isNull(rootContext.tableInfo.columnSize)) {
        throw new Error("Define PageContext.tableInfo.columnSize");
    }
​
    var RootContext							= rootContext;
    var selectors                           = rootContext.selectors;
    RootContext.contextName 	        	= rootContext.selectors.contextName;
    RootContext.$rootContext	        	= $(selectors.rootContextSelector);
    RootContext.$dateSearchType				= RootContext.$rootContext.find(selectors.dateSearchTypeSelector);
    RootContext.$startDt 					= RootContext.$rootContext.find(selectors.startDateSelector);
    RootContext.$endDt 						= RootContext.$rootContext.find(selectors.endDateSelector);
    RootContext.$dateButtonArea 			= RootContext.$rootContext.find(selectors.dateButtonAreaSelector);
    RootContext.$divData 					= RootContext.$rootContext.find(selectors.divDataSelector);
    RootContext.$divDataTbody               = RootContext.$rootContext.find(selectors.divDataTobodySelector);
    RootContext.$btnClear 					= RootContext.$rootContext.find(selectors.btnClearSelector);
    RootContext.$btnSearch 					= RootContext.$rootContext.find(selectors.btnSearchSelector);
    RootContext.$searchType 				= RootContext.$rootContext.find(selectors.searchTypeSelector);
    RootContext.$searchText 				= RootContext.$rootContext.find(selectors.searchTextSelector);
    RootContext.$pageNum					= RootContext.$rootContext.find(selectors.pageNumSelector);
    RootContext.$pageSize					= RootContext.$rootContext.find(selectors.pageSizeSelector);
    RootContext.$pageSizeSelect				= RootContext.$rootContext.find(selectors.pageSizeSelectSelector);
    RootContext.$pageSortColumn				= RootContext.$rootContext.find(selectors.pageSortColumnSelector);
    RootContext.$pageSortOrder				= RootContext.$rootContext.find(selectors.pageSortOrderSelector);
    RootContext.$autoSearchYn				= RootContext.$rootContext.find(selectors.autoSearchYnSelector);
    RootContext.$maskYn    					= RootContext.$rootContext.find(selectors.maskYnSelector);
    RootContext.$pageUseYn    				= RootContext.$rootContext.find(selectors.pageUseYnSelector);
    RootContext.$masking    				= RootContext.$rootContext.find(selectors.maskingSelector);
    RootContext.$pagingTop					= RootContext.$rootContext.find(selectors.pagingTopSelector);
    RootContext.$pagingBottom				= RootContext.$rootContext.find(selectors.pagingBottomSelector);
    RootContext.$btnDownload				= RootContext.$rootContext.find(selectors.btnDownloadSelector);
    RootContext.$basePagingParameter		= RootContext.$rootContext.find(selectors.basePagingParameterSelector);
    RootContext.$searchBoxSearchParameter	= RootContext.$rootContext.find(selectors.searchBoxSearchParameterSelector);
​
    var pageInfo = rootContext.pageInfo;
    if(pageInfo !== undefined && pageInfo !== null) {
        RootContext.pageSizeSelectList          = rootContext.pageInfo.pageSizeSelectList; //pageSizeSelect option에 사이즈 리스트
    }
​
    //FromTo 달력 포커스 이벤트
    RootContext.$startDt.bind("focus", function clearCalendarButton(){
        CommonJs.clearCalendarButton(RootContext.$dateButtonArea);
    });
    RootContext.$endDt.bind("focus", function clearCalendarButton(){
        CommonJs.clearCalendarButton(RootContext.$dateButtonArea);
    });
​
    //검색 조건 초기화 버튼 클릭 이벤트
    RootContext.$btnClear.bind("click", function initSearchCondition() {
        var initializeSearchConditionFunctions = RootContext.getInitializeSearchConditionFunctions();
        if(initializeSearchConditionFunctions === undefined) {
            throw new Error("Define getInitializeSearchConditionFunctions function");
        }
        if(initializeSearchConditionFunctions.preExecute !== undefined && typeof initializeSearchConditionFunctions.preExecute === "function") {
            initializeSearchConditionFunctions.preExecute();
        }
        initializeSearchConditionFunctionCommonExecute();
        if(initializeSearchConditionFunctions.postExecute !== undefined && typeof initializeSearchConditionFunctions.postExecute === "function") {
            initializeSearchConditionFunctions.postExecute();
        }
    });
​
    // searchButtonType : SEARCH_BUTTON, PAGING_BUTTON
    RootContext.goPage = function(param, searchButtonType){
        // 테이블 정렬을 사용한다면 페이지번호,정렬기준 세팅
        if(RootContext.defaultPagingParameter.useSorting) {
            var defaultSortColumn = RootContext.defaultPagingParameter.sortColumn;
            var defaultSortOrder = RootContext.defaultPagingParameter.sortOrder;
            if(!CommonJs.isNumber(param)){
                var sortInfo = param.split(" ");
                if(CommonJs.isNull(sortInfo) || CommonJs.isNull(sortInfo[0]) || CommonJs.isNull(sortInfo[1])) {
                    console.log("SortInfo error! SortColumn and SortOrder is set default value. sortInfo : ", sortInfo);
                    RootContext.$pageSortColumn.val(defaultSortColumn);
                    RootContext.$pageSortOrder.val(defaultSortOrder);
                } else {
                    RootContext.$pageSortColumn.val(sortInfo[0]);
                    RootContext.$pageSortOrder.val(sortInfo[1]);
                }
                param = 1;
            }
            if(CommonJs.isNull(RootContext.$pageSortColumn.val())) {
                console.log("SortColumn is null! SortColumn and SortOrder is set default value. sortInfo : ", sortInfo);
                RootContext.$pageSortColumn.val(defaultSortColumn);
                RootContext.$pageSortOrder.val(defaultSortOrder);
            }
        }
        RootContext.$pageNum.val(param);
        RootContext.searchList(searchButtonType);
    };
​
    // 검색 버튼 클릭 이벤트
    RootContext.$btnSearch.bind("click", function btnSearchClickEvent() {
        RootContext.goPage(1, 'SEARCH_BUTTON');
    });
​
    // form만들기 메서드
    RootContext.getSearchParameterForm = function() {
        if($("#searchType").val == '0400' && $("#searchValue").val() != null) {
            $("#searchValue").val(CommonJs.removeHyphen($("#searchValue").val()));
        }
        var basePagingParameter = RootContext.$basePagingParameter.formToJson();
        var baseSearchParameter = RootContext.$searchBoxSearchParameter.formToJson();
        if(CommonJs.isNull(RootContext.$searchBoxSearchParameter) || RootContext.$searchBoxSearchParameter.length === 0) {
            baseSearchParameter = {};
        } else {
            baseSearchParameter.searchText = RootContext.$searchText.val();
            if(RootContext.selectors.startDateSelector !== undefined) {
                baseSearchParameter.startDate = CommonJs.replaceAll(RootContext.$startDt.val(), "/", "");
            }
            if(RootContext.selectors.endDateSelector !== undefined) {
                baseSearchParameter.endDate = CommonJs.replaceAll(RootContext.$endDt.val(), "/", "");
            }
        }
        var mergedParameter = $.extend(basePagingParameter, baseSearchParameter);
        if(RootContext.getCustomSearchParameterForm === undefined || typeof RootContext.getCustomSearchParameterForm !== "function") {
            throw new Error("Define getSearchParameterFormExtended function");
        } else {
            return RootContext.getCustomSearchParameterForm(mergedParameter);
        }
    };
​
    // 전체 다운로드 버튼 클릭 이벤트
    RootContext.$btnDownload.bind("click", function btnDownloadClickEvent() {
        if(RootContext.getExcelDownloadFetchInfo === undefined) {
            throw new Error("Define getExcelDownloadFetchInfo function");
        }
        var downloadFetchInfo = RootContext.getExcelDownloadFetchInfo();
        if(!downloadFetchInfo.isValidFunction()) return;
        var fetchForm = {};
        if(!CommonJs.isNull(downloadFetchInfo.url)) {
            fetchForm.url = downloadFetchInfo.url;
        } else {
            throw new Error("[ExcelDownloadFetch] url is required");
        }
        if(!CommonJs.isNull(downloadFetchInfo.contentType)) {
            fetchForm.contentType = downloadFetchInfo.contentType;
        }
        if(!CommonJs.isNull(downloadFetchInfo.method)) {
            fetchForm.method = downloadFetchInfo.method;
        } else {
            throw new Error("[ExcelDownloadFetch] method is required");
        }
        if(!CommonJs.isNull(downloadFetchInfo.returnType)) {
            fetchForm.returnType = downloadFetchInfo.returnType;
        }
        if(!CommonJs.isNull(downloadFetchInfo.body)) {
            fetchForm.body = downloadFetchInfo.body;
        } else {
            if(downloadFetchInfo.method.toUpperCase() === "POST") {
                throw new Error("[ExcelDownloadFetch] body is required when POST method");
            }
        }
        FetchJs.fetch(fetchForm).then(downloadFetchInfo.successFunction, downloadFetchInfo.errorFunction);
    });
​
    // pageSize 변경 이벤트
    RootContext.$pageSizeSelect.bind("change", function pageSizeSelectChangeEvent() {
        var pageSize = RootContext.$pageSizeSelect.val();
        RootContext.$pageSize.val(pageSize);
        RootContext.goPage(1);
    });
​
    // ui init
    CommonJs.setFromToCalendarButton(RootContext.$dateButtonArea, RootContext.$startDt, RootContext.$endDt, [0, -1, "today", 180, 365]);
    // CommonJs.setFromToCalendarButton(RootContext.$dateButtonArea, RootContext.$startDt, RootContext.$endDt, [-1, -2, 7, 30, 90]);
    CommonJs.setFromToCalendar(RootContext.$startDt, RootContext.$endDt, CommonJs.addDate(CommonJs.today(), -365), CommonJs.today());
​
    // 페이지 카운트, Combo 셋팅
    CommonJs.setPageSelect(RootContext.$pageSizeSelect, null, RootContext.pageSizeSelectList);
​
    // 페이지사이즈 초기화
    RootContext.$pageSize.val(RootContext.$pageSizeSelect.val());
​
    //use select 작업
    CommonJs.setScroll(RootContext.$divData);
​
    // table column 세팅
    if(!CommonJs.isNull(rootContext.tableInfo.columns)) {
        // set colgroup
        var colgroups = rootContext.tableInfo.columns[0];
        //rootContext.$divData.find('colgroup').html("");
        colgroups.forEach(function(element, index) {
            rootContext.$divData.find('colgroup').append('<col width="'+element+'%">');
        });
​
        var headers = rootContext.tableInfo.columns.slice(1);
​
        function getColspan(tr) {
            var count = 0;
            var colspans = new Array(tr.length);
            for(var i=0; i<tr.length; i++) {
                count++;
                var finalNull = (i === tr.length-1);
                var isNextNew = (!CommonJs.isNull(tr[i+1]));
                if(finalNull || isNextNew) {
                    var index = count > 1 ? i - (count - 1) : i;
                    colspans[index] = count;
                    count = 0;
                }
            }
            return colspans;
        }
​
        function getRows(trs, i) {
            var arr = [];
            trs.forEach(function(element, index) {
                arr.push(element[i]);
            });
            return arr;
        }
​
        var colSpans = [];
        for(var row = 0; row < headers.length; row++) {
            colSpans.push(getColspan(headers[row]));
        }
​
        var rowHeaders = (function() {
            var rowHeaders = [];
            for(var col = 0; col < headers[0].length; col++) {
                rowHeaders.push(getRows(headers, col));
            }
            return rowHeaders;
        })();
        var rowSpans = [];
        for(var col = 0; col < rowHeaders.length; col++) {
            rowSpans.push(getColspan(rowHeaders[col]));
        }
​
        var trList = [];
        for(var row = 0; row < headers.length; row++) {
            var thObjList = [];
            for(var col = 0; col < headers[0].length;) {
                var thObj = {};
                thObj.text = headers[row][col];
                thObj.colspan = colSpans[row][col];
                thObj.rowspan = rowSpans[col][row];
                thObjList.push(thObj);
                var nextOffset = thObj.colspan > 1 ? (colSpans[row][col]) : 1;
                col += nextOffset;
            }
            trList.push(thObjList);
        }
​
        var $thead = rootContext.$divData.find('thead');
        for(var row = 0; row < trList.length; row++) {
            var $tr = document.createElement('tr');
            for(var col = 0; col < trList[row].length; col++) {
                var thObj = trList[row][col];
                if(CommonJs.isNull(thObj.colspan) || CommonJs.isNull(thObj.rowspan)) {
                    continue;
                }
                var $th = document.createElement('th');
                $th.textContent = thObj.text;
                $th.rowSpan = thObj.rowspan;
                $th.colSpan = thObj.colspan;
                $tr.append($th);
            }
​
            //$thead.html("");
            $thead.append($tr);
        }
    }// table column 세팅 끝
​
    // 선택박스 초기화 작업
    $("body").find("select").each(function () {
        $(this).chosen({disable_search: true});
    });
​
    function initializeSearchConditionFunctionCommonExecute() {
        CommonJs.clearCalendarButton(RootContext.$dateButtonArea);
        CommonJs.setFromToCalendar(RootContext.$startDt, RootContext.$endDt, CommonJs.addDate(CommonJs.today(), -365), CommonJs.today());
    }
​
    if(RootContext.initialize !== undefined && typeof RootContext.initialize === "function") {
        RootContext.initialize();
    }
    if(RootContext.cacheAfterRootContext !== undefined && typeof RootContext.cacheAfterRootContext === "function") {
        RootContext.cacheAfterRootContext();
    }
    RootContext.setList = ListTemplate.prototype.setList;
    RootContext.initializeTbody = ListTemplate.prototype.initializeTbody;
    RootContext.initializePagingTopBottom = ListTemplate.prototype.initializePagingTopBottom;
​
    return RootContext;
}
​
// 리스트세팅하기
ListTemplate.prototype.setList = function (totalCnt, dataList) {
    if(CommonJs.isNull(this.tableInfo) || CommonJs.isNull(this.tableInfo.columnSize)) {
        throw new Error("PageContext.tableInfo.columnSize cannot be null.");
    }
    var getDataToHtmlFunction = this.getHtml;
    if(!getDataToHtmlFunction) {
        throw new Error("define getHtml function");
    }
    var isEmpty = (totalCnt < 1);
    if (isEmpty) {
        this.$divDataTbody.html(PortalUiDrawer.getEmptyListToHtmlTag(this.tableInfo.columnSize, T_0505));
        this.$pagingTop.find("strong").text(0);
        this.$pagingBottom.empty();
    } else {
        var dataToHtml = "";
        for (var i = 0; i < dataList.length; i++) {
            var idx = i + 1;
            idx = (this.$pageNum.val() - 1) * this.$pageSize.val() + idx;
            dataToHtml += getDataToHtmlFunction(idx, dataList[i]);
        }
        this.$divDataTbody.html(dataToHtml);
        this.$pagingTop.find("strong").text(totalCnt);
        CommonJs.setScrollTop(this.$divData);
        CommonJs.setPage(this.$pagingTop, this.$pagingBottom, totalCnt, this.$pageNum, this.$pageSize, null, null, this.contextName);
    }
};
​
// tbody 초기화하기
ListTemplate.prototype.initializeTbody = function() {
    if(CommonJs.isNull(this.tableInfo) || CommonJs.isNull(this.tableInfo.columnSize)) {
        throw new Error("pageContext.tableInfo.columnSize cannot be null.");
    }
    var tmpStr  = "";
    tmpStr += "<tr class='no'>";
    tmpStr += "<td colspan='" + this.tableInfo.columnSize + "' class='search_no'>";
    tmpStr += "<p class='no_search01 tc'>" + M_0146 + "</span></p>";
    tmpStr += "</td>";
    this.$divDataTbody.html(tmpStr);
};
​
ListTemplate.prototype.initializePagingTopBottom = function() {
    this.$pagingTop.find("strong").text(0);
    this.$pagingBottom.empty();
}
​
