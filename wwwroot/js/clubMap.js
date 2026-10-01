// wwwroot/js/clubMap.js
// Black and white Leaflet map for the club home page.
window.clubMap = (function () {
    let map = null;
    let layer = null;
    let markers = {};
    let onResize = null;

    const reduceMotion = () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Width of the white info panel (+ gap) that sits on top of the map on desktop.
    const panelOffset = () => (window.innerWidth > 900 ? 432 : 0);

    const esc = s =>
        String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));

    function tooltipHtml(r, isNext) {
        return `
          <div class="tip">
            <div class="tip-head">
              ${isNext ? '<span class="tip-badge">Next ride</span>' : ''}
              <strong>${esc(r.title)}</strong>
            </div>
            <dl class="tip-facts">
              <dt>When</dt><dd>${esc(r.when)}</dd>
              <dt>Where</dt><dd>${esc(r.meet)}</dd>
              <dt>Route</dt><dd>${esc(r.route)}, ${esc(r.distance)}</dd>
              <dt>Riding</dt><dd>${esc(r.kind)}</dd>
            </dl>
          </div>`;
    }

    function drawRides(rides, nextId) {
        if (layer) layer.clearLayers();
        else layer = L.layerGroup().addTo(map);
        markers = {};

        rides.forEach(r => {
            const isNext = r.id === nextId;

            const icon = L.divIcon({
                className: 'pin-icon',
                html:
                    '<div class="pin-wrap' + (isNext ? ' is-next' : '') + '">' +
                    (isNext ? '<span class="pulse"></span>' : '') +
                    '<span class="pin"></span></div>',
                iconSize: [34, 40],
                iconAnchor: [17, 38],
                tooltipAnchor: [0, -34]
            });

            const m = L.marker([r.lat, r.lng], {
                icon,
                title: r.title,
                alt: r.title,
                riseOnHover: true,
                zIndexOffset: isNext ? 1000 : 0
            }).addTo(layer);

            // Tooltip opens on hover by default.
            m.bindTooltip(tooltipHtml(r, isNext), {
                direction: 'top',
                className: 'ride-tip',
                opacity: 1
            });

            // Tap on touch screens, focus for keyboard users.
            m.on('click', () => m.openTooltip());
            const el = m.getElement();
            if (el) {
                el.addEventListener('focus', () => m.openTooltip());
                el.addEventListener('blur', () => m.closeTooltip());
            }

            markers[r.id] = m;
        });
    }

    function fit(rides, animate) {
        if (!rides.length) return;
        const bounds = L.latLngBounds(rides.map(r => [r.lat, r.lng]));
        map.fitBounds(bounds, {
            paddingTopLeft: [panelOffset() + 40, 60],
            paddingBottomRight: [60, 60],
            maxZoom: 12,
            animate: animate && !reduceMotion()
        });
    }

    return {
        init(elementId, rides, nextId, apiKey) {
            this.destroy();

            map = L.map(elementId, {
                zoomControl: false,
                scrollWheelZoom: false // keeps page scrolling smooth; click the map to enable
            });

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // CARTO tile layer URL with dynamic API key parameter passed from C# appsettings.json
            const tileUrl = apiKey 
                ? `https://basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png?key=${apiKey}`
                : `https://basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png`;

            L.tileLayer(tileUrl, {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);

            map.on('click', () => map.scrollWheelZoom.enable());
            map.on('mouseout', () => map.scrollWheelZoom.disable());

            drawRides(rides, nextId);
            fit(rides, false);

            onResize = () => map && map.invalidateSize();
            window.addEventListener('resize', onResize);
        },

        setRides(rides, nextId) {
            if (!map) return;
            drawRides(rides, nextId);
            fit(rides, true);
        },

        focus(id) {
            const m = markers[id];
            if (!m || !map) return;

            const zoom = 13;
            // Shift the center so the pin lands in the open area beside the panel.
            const target = map.unproject(
                map.project(m.getLatLng(), zoom).subtract([panelOffset() / 2, 0]),
                zoom
            );

            if (reduceMotion()) {
                map.setView(target, zoom, { animate: false });
                m.openTooltip();
            } else {
                map.flyTo(target, zoom, { duration: 0.8 });
                setTimeout(() => m.openTooltip(), 850);
            }
        },

        destroy() {
            if (onResize) window.removeEventListener('resize', onResize);
            onResize = null;
            if (map) map.remove();
            map = null;
            layer = null;
            markers = {};
        }
    };
})();