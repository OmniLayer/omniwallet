                  <div class="left_bar jumbotron col-sm-3 col-sm-pull-9 col-md-2 col-md-pull-10">
                     <nav>
                        <div class="navItems col-xs-6 col-sm-12 no-padding" ng-repeat="val in values">
                           <a href="index.html?currency={{val.currency}}" class="panel-link">
                              <div class="panel panel-default {{val.selected}}">
                                 <div class="panel-heading">
                                    <img ng-src="img/{{val.trend}}Icon.png"/> {{val.name}}
                                 </div>
                                 <div class="panel-body" ng-style="{'background': val.trend2}">
                                    <div class="col-xs-3 no-padding">{{val.currency}}</div>
                                    <div class="col-xs-9">{{val.name2}}</div>
                                 </div>
                              </div>
                           </a>
                        </div>
                     </nav>
                  </div>
               </div>
            </div>
            <!-- /container -->
         </div>
         <div id="push"></div>
      </div>
      <div id="footer" ng-controller="RevisionController" ng-init="getData()">
         <div class="container c-footer-container">
            <div class="revision">Updated: {{revision.last_parsed}} rev <a href='{{revision.url}}'>{{revision.commit_hexsha|characters:6}}</a> ({{revision.commit_time}})</div>
            <div class="muted credit">&copy; Masterchain Grazcoin Grimentz 2013.</div>
         </div>
      </div>
   </body>
</html>

