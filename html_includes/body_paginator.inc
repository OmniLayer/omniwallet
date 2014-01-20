                           <div class="paginator">
                              <ul class="pagination">
                                 <li class="{{prevClass}}"><a ng-href='#here' ng-click='prevPages()'>&nbsp;prev&nbsp;</a></li>
                                 <li ng-repeat="page in pages" class="{{page.class}}"><a ng-href="#here" ng-click='getData(page.number)'>{{page.number}}</a></li>
                                 <li class="{{nextClass}}"><a ng-href='#here' ng-click='nextPages()'>&nbsp;next&nbsp;</a></li>
                              </ul>
                              <br/>
                              <ul class="pagination">
                                 <li ng-repeat="page in pages" class="{{page.class}}"><a ng-href="#here" ng-click='partToggle(page.number)'><img ng-click="alert('ciao');" src="img/{{page.img}}.png" /></a></li>
                              </ul>
                           </div>
