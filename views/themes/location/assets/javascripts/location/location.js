'use strict';

function qorInitMapAssets(selector) {
    $(selector).each(function() {
        let $selector = $(this),
            mapData = $selector.data(),
            mapSource = mapData.locationMapsource,
            apiKey = mapData[`${mapSource}Apikey`],
            id = `qor_map_${mapSource}`,
            src;

        if (mapSource === 'baidu') {
            if ($(`#${id}`).length) {
                new QorLocation($(this)).initBaiduMap();
                return;
            }
            src = `//api.map.baidu.com/api?v=2.0&ak=${apiKey}&callback=qorInitBaiduMap`;
        } else if (mapSource === 'google') {
            if ($(`#${id}`).length) {
                new QorLocation($(this)).initBaiduMap();
                return;
            }
            src = `//maps.googleapis.com/maps/api/js?key=${apiKey}&callback=qorInitGoogleMap`;
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

function qorInitGoogleMap() {
    $('[data-toggle="qor.location"]').each(function() {
        new QorLocation($(this)).initGoogleMap();
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
    this.roles = {};
    this.init();
}

QorLocation.prototype = {
    constructor: QorLocation,

    init: function() {
        let $roles = this.$element.find('[data-location-role]'),
            roles = this.roles,
            roleName;

        // country city region address zip latitude longitude geocode reverseGeocode map currentAddress

        $roles.each(function() {
            roleName = $(this).data('location-role');
            roles[`$${roleName}`] = $(this);
        });
        this.bind();
    },

    bind: function() {
        this.roles.$reverseGeocode.on('click', this.getAddress.bind(this));
        this.roles.$geocode.on('click', this.getPosition.bind(this));
    },

    unbind: function() {},

    initGoogleMap: function() {},

    initBaiduMap: function() {
        let roles = this.roles,
            latitude = Number(roles.$latitude.val()),
            longitude = Number(roles.$longitude.val()),
            point = new BMap.Point(longitude, latitude),
            _this = this;

        if (latitude === 0 && longitude === 0) {
            let geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(
                function(r) {
                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        _this.setupBaiduMap(r.point);
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
            this.setupBaiduMap(point);
        }
    },

    setupBaiduMap: function(point) {
        let map = new BMap.Map(this.$element.find('.qor__location-map')[0]);

        map.centerAndZoom(point, 18);
        map.enableScrollWheelZoom();

        let marker = new BMap.Marker(point);
        map.addOverlay(marker);
        map.panTo(point);
        marker.enableDragging();
        this.marker = marker;
        this.baiduMap = map;
        this.baiduMapGeo = new BMap.Geocoder();

        this.moveBaiduMapMarker(marker.getPosition());
        marker.addEventListener('dragend', this.moveBaiduMapMarker.bind(this));
    },

    moveBaiduMapMarker: function(data) {
        let $location = this.$element.find('.qor__location-address');

        this.baiduMapGeo.getLocation(new BMap.Point(data.lng || data.point.lng, data.lat || data.point.lat), function(result) {
            if (result) {
                $location.html(result.address);
            }
        });
    },

    getPosition: function() {
        let map = this.baiduMap,
            roles = this.roles,
            marker = this.marker,
            city = roles.$city.val(),
            address = roles.$address.val(),
            myGeo = this.baiduMapGeo;

        if (city == '' || address == '') {
            window.QOR.qorConfirm('Please ensure that the city and address have been filled in correctly!');
            return;
        }
        myGeo.getPoint(
            address,
            function(point) {
                if (point) {
                    roles.$latitude.val(point.lat);
                    roles.$longitude.val(point.lng);
                    map.centerAndZoom(point, 18);
                    marker.setPosition(point);
                }
            },
            city
        );
    },

    getAddress: function() {
        let pos = this.marker.getPosition();

        this.roles.$latitude.val(pos.lat);
        this.roles.$longitude.val(pos.lng);
        this.getAddressFromPosition(pos);
    },

    getAddressFromPosition: function(pos) {
        let myGeo = this.baiduMapGeo,
            roles = this.roles;

        myGeo.getLocation(new BMap.Point(pos.lng, pos.lat), function(result) {
            if (result) {
                roles.$address.val(result.address);
                roles.$city.val(result.addressComponents.city);
                roles.$region.val(result.addressComponents.district);
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
