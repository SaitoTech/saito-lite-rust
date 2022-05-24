module.exports = (app) => {
    return `
    <div class="container clearfix">

    <form action="#" method="post" class="mb-0">
        <div class="bottommargin-sm">
            <div class="row">
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Default Date</label>
                    <input type="text" value="" class="form-control text-start component-datepicker default" placeholder="MM/DD/YYYY">
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Highlight Today</label>
                    <input type="text" value="" class="form-control text-start component-datepicker today" placeholder="MM/DD/YYYY">
                </div>
                <div class="w-100"></div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Enables Past Days</label>
                    <input type="text" value="" class="form-control text-start component-datepicker past-enabled" placeholder="MM/DD/YYYY">
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">With Calendar Icon</label>
                    <div class="input-group">
                        <input type="text" value="" class="form-control text-start component-datepicker past-enabled" placeholder="MM/DD/YYYY">
                        <div class="input-group-text"><i class="icon-calendar2"></i></div>
                    </div>
                </div>
                <div class="w-100"></div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Date Format</label>
                    <input type="text" value="" class="form-control text-start component-datepicker format" placeholder="DD-MM-YYYY">
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">AutoClose Off</label>
                    <input type="text" value="" class="form-control text-start component-datepicker autoclose" placeholder="MM-DD-YYYY">
                </div>
                <div class="w-100"></div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Disabled Days of Sunday</label>
                    <input type="text" value="" class="form-control text-start component-datepicker disabled-week" placeholder="MM-DD-YYYY">
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Highlighted Days of Week</label>
                    <input type="text" value="" class="form-control text-start component-datepicker highlighted-week" placeholder="MM-DD-YYYY">
                </div>
                <div class="w-100"></div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Multiple Dates Entry</label>
                    <input type="text" value="" class="form-control text-start component-datepicker multidate" placeholder="MM-DD-YYYY">
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Month View</label>
                    <input type="text" value="" class="form-control text-start component-datepicker mnth" placeholder="MM-YYYY">
                </div>
                <div class="w-100"></div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Date Range</label>
                    <div class="input-daterange component-datepicker input-group">
                        <input type="text" value="" class="form-control text-start" placeholder="MM/DD/YYYY">
                        <div class="input-group-text">to</div>
                        <input type="text" value="" class="form-control text-start" placeholder="MM/DD/YYYY">
                    </div>
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Inline Calendar</label>
                    <div class="inline-calendar component-datepicker"></div>
                </div>
                <div class="w-100"></div>
                <!-- Time Picker -->
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Date &amp; Time Picker</label>
                    <div class="form-group">
                        <div class="input-group text-start" data-target-input="nearest" data-target=".datetimepicker">
                            <input type="text" class="form-control datetimepicker-input datetimepicker" data-target=".datetimepicker" placeholder="MM/DD/YYYY 00:00 AM/PM"/>
                            <div class="input-group-text" data-target=".datetimepicker" data-toggle="datetimepicker"><i class="icon-calendar"></i></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Time Picker</label>
                    <div class="form-group">
                        <div class="input-group text-start" data-target-input="nearest" data-target=".datetimepicker1">
                            <input type="text" class="form-control datetimepicker-input datetimepicker1" data-target=".datetimepicker1" placeholder="00:00 AM/PM" />
                            <div class="input-group-text"  data-target=".datetimepicker1" data-toggle="datetimepicker"><i class="icon-clock"></i></div>
                        </div>
                    </div>
                </div>
                <div class="w-100"></div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Inline Date and Time</label>
                    <div class="datetimepicker2"></div>
                </div>
                <div class="col-md-6 bottommargin-sm">
                    <label for="">Without Icon</label>
                    <input type="text" class="form-control datetimepicker-input datetimepicker3 text-start" data-toggle="datetimepicker" data-target=".datetimepicker3" placeholder="00:00 AM/PM" />
                </div>
            </div>
        </div>
    </form>
    <!-- Button trigger modal -->
    <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#myModal">Date &amp; Time Picker in a modal</button>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-body">
                <div class="modal-content clearfix">
                    <div class="modal-body">
                        <h4>Date &amp; Time Picker in a modal</h4>
                        <input type="text" class="form-control datetimepicker-input datetimepicker4 text-start" data-toggle="datetimepicker" data-target=".datetimepicker4" placeholder="00:00 AM/PM" />
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="line"></div>

    <h3>Advanced Date Range Picker</h3>
    <div class="row clearfix">

        <div class="col-lg-6 bottommargin">
            <label>Date Range Picker:</label>
            <input type="text" class="form-control daterange1" value="01/01/2021 - 01/31/2021" />
        </div>

        <div class="col-lg-6 bottommargin">
            <label>Date and Time Range Picker:</label>
            <input type="text" class="form-control daterange2" value="01/01/2021 1:30 PM - 01/01/2021 2:00 PM" />
        </div>

        <div class="w-100"></div>

        <div class="col-lg-6 bottommargin">
            <label>DropDown Single Date Picker:</label>
            <input type="text" class="form-control daterange3" value="10/24/1984" />
        </div>

        <div class="col-lg-6 bottommargin clearfix">
            <label>Predefined Ranges:</label>
            <div class="reportrange float-end form-control" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">
                <i class="icon-calendar"></i>&nbsp;
                <span></span> <b class="caret"></b>
            </div>
        </div>

        <div class="w-100"></div>

        <div class="col-lg-6 clearfix">
            <label>Custom Ranges First Time Active:</label>
            <input type="text" class="form-control daterange1 reportrange float-start" value="01/01/2021 - 01/31/2021" />
        </div>

        <div class="w-100 bottommargin d-block d-lg-none d-xl-block"></div>

        <div class="col-lg-6">
            <label>Input Initially Empty:</label>
            <input type="text" class="daterange4 form-control" value="" />
        </div>

    </div>

</div>
    `
}