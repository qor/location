'use strict';

function qorInitMapAssets(selector) {
    $(selector).each(function() {
        let $selector = $(this),
            mapData = $selector.data(),
            mapSource = mapData.locationMapsource,
            apiKey = mapData[`${mapSource}Apikey`],
            id = `qor_map_${mapSource}`,
            src;

        if ($(`#${id}`).length) {
            return;
        }

        if (mapSource === 'baidu') {
            src = `//api.map.baidu.com/api?v=2.0&ak=${apiKey}&callback=qorInitBaiduMap`;
        } else if (mapSource === 'google') {
            src = `//maps.googleapis.com/maps/api/js?key=${apiKey}`;
        } else {
            console.log('QOR only support baidu or google Map, please make sure your Map config is correct!');
        }

        qorLoadMapScript(src, id);
    });
}

function qorInitBaiduMap() {
    $('[data-toggle="qor.location"]').each(function() {
        new QorLocation($(this)).initBaiduMap();
    });
}

function qorLoadMapScript(src, id) {
    let script = document.createElement('script');
    script.src = src;
    script.id = id;
    document.body.appendChild(script);
}

function QorLocation(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, QorLocation.DEFAULTS, $.isPlainObject(options) && options);
    this.init();
}

QorLocation.prototype = {
    constructor: QorLocation,

    init: function() {
        let $roles = this.$element.find('[data-location-role]'),
            _this = this,
            roleName;

        // country city region address zip latitude longitude geocode reverseGeocode map currentAddress

        $roles.each(function() {
            roleName = $(this).data('location-role');
            _this[`$${roleName}`] = $(this);
        });
        this.bind();
    },

    bind: function() {
        this.$reverseGeocode.on('click', this.getmarkerPosition.bind(this));
    },

    unbind: function() {},

    initBaiduMap: function() {
        let map = new BMap.Map(this.$element.find('.qor__location-map')[0]),
            latitude = Number(this.$latitude.val()), //纬度
            longitude = Number(this.$longitude.val()), //经度
            point = new BMap.Point(longitude, latitude),
            _this = this;

        map.centerAndZoom(point, 15);
        map.enableScrollWheelZoom();

        if (latitude === 0 && longitude === 0) {
            let geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(
                function(r) {
                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        let marker = new BMap.Marker(r.point);
                        map.addOverlay(marker);
                        map.panTo(r.point);
                        marker.enableDragging();

                        _this.marker = marker;
                        console.log('您的位置：' + r.point.lng + ',' + r.point.lat);
                    } else {
                        console.log('failed' + this.getStatus());
                    }
                },
                {enableHighAccuracy: true}
            );

            // let options = {
            //     enableHighAccuracy: true,
            //     timeout: 5000,
            //     maximumAge: 0
            // },
            // _this = this;

            // navigator.geolocation.getCurrentPosition(
            //     function(pos) {
            //         console.log(pos);
            //         // latitude = pos.coords.latitude;
            //         // longitude = pos.coords.longitude;
            //         // _this.setupBaiduMap(longitude, latitude);
            //     },
            //     function(err) {
            //         console.warn(`ERROR(${err.code}): ${err.message}`);
            //         return;
            //     },
            //     options
            // );
        } else {
            let marker = new BMap.Marker(point);
            map.addOverlay(marker);
            marker.enableDragging();
            this.marker = marker;
        }
    },

    getmarkerPosition: function() {
        console.log(this.marker.getPosition());
        this.getAddressFromPosition(this.marker.getPosition());
    },

    getAddressFromPosition: function(pos) {
        let myGeo = new BMap.Geocoder();
        // 根据坐标得到地址描述
        myGeo.getLocation(new BMap.Point(pos.lng, pos.lat), function(result) {
            if (result) {
                console.log(result);
            }
        });
    }
};

$(function() {
    let selector = '[data-toggle="qor.location"]',
        NAMESPACE = 'qor.location',
        EVENT_ENABLE = 'enable.' + NAMESPACE;

    qorInitMapAssets(selector);

    $(document).on(EVENT_ENABLE, function() {
        qorInitMapAssets(selector);
    });
});
