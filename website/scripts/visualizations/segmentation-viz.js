import { BaseVisualization } from './base-visualization.js';

export class SegmentationViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      opacity: 0.6,
      classes: {
        sky: { label: 'Sky', color: 'rgba(56, 189, 248, opacity)', visible: true },     // Sky Blue
        road: { label: 'Road', color: 'rgba(100, 116, 139, opacity)', visible: true },   // Slate Gray
        building: { label: 'Building', color: 'rgba(244, 63, 94, opacity)', visible: true }, // Rose Red
        car: { label: 'Car', color: 'rgba(234, 179, 8, opacity)', visible: true }         // Yellow
      }
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout">
        <div class="nv-viz-segmentation-viewer">
          <div class="nv-seg-container">
            <!-- Simulated background scene -->
            <div class="nv-seg-background-scene">
              <!-- Sky segment -->
              <div class="nv-seg-region nv-seg-sky" style="height: 140px; top: 0;">Sky</div>
              <!-- Building segment -->
              <div class="nv-seg-region nv-seg-building" style="height: 180px; width: 150px; top: 60px; left: 20px;">Building</div>
              <!-- Road segment -->
              <div class="nv-seg-region nv-seg-road" style="height: 120px; bottom: 0;">Road</div>
              <!-- Car segment -->
              <div class="nv-seg-region nv-seg-car" style="height: 60px; width: 100px; bottom: 30px; right: 65px;">Car</div>
            </div>
          </div>
        </div>
        
        <div class="nv-viz-sidebar">
          <h3>Semantic Segmentation Mask</h3>
          
          <div class="nv-viz-control-group">
            <label for="seg-opacity-slider">Mask Opacity: <span class="seg-opacity-val">60%</span></label>
            <input type="range" id="seg-opacity-slider" min="0" max="1" step="0.1" value="0.6" class="nv-slider" aria-label="Mask opacity slider">
          </div>

          <div class="nv-viz-control-group">
            <label>Segmentation Classes (Toggle visibility):</label>
            <div class="nv-seg-class-toggles">
              ${Object.keys(this.state.classes).map(key => {
                const cls = this.state.classes[key];
                return `
                  <label class="nv-seg-toggle-label">
                    <input type="checkbox" class="nv-seg-checkbox" data-class="${key}" checked>
                    <span class="nv-seg-color-indicator indicator-${key}"></span>
                    ${cls.label}
                  </label>
                `;
              }).join('')}
            </div>
          </div>
          
          <button class="nv-btn nv-btn-reset">Reset Classes</button>
        </div>
      </div>
    `;

    this.opacitySlider = this.container.querySelector('#seg-opacity-slider');
    this.opacityVal = this.container.querySelector('.seg-opacity-val');
    this.checkboxes = this.container.querySelectorAll('.nv-seg-checkbox');
    this.resetBtn = this.container.querySelector('.nv-btn-reset');
    
    this.skyRegion = this.container.querySelector('.nv-seg-sky');
    this.buildingRegion = this.container.querySelector('.nv-seg-building');
    this.roadRegion = this.container.querySelector('.nv-seg-road');
    this.carRegion = this.container.querySelector('.nv-seg-car');

    this.opacitySlider.addEventListener('input', () => {
      this.state.opacity = parseFloat(this.opacitySlider.value);
      this.opacityVal.textContent = `${Math.round(this.state.opacity * 100)}%`;
      this.render();
    });

    this.checkboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        const clsKey = chk.dataset.class;
        this.state.classes[clsKey].visible = chk.checked;
        this.render();
      });
    });

    this.resetBtn.addEventListener('click', () => this.reset());
  }

  onReset() {
    this.state.opacity = 0.6;
    this.opacitySlider.value = 0.6;
    this.opacityVal.textContent = '60%';
    Object.keys(this.state.classes).forEach(key => {
      this.state.classes[key].visible = true;
    });
    this.checkboxes.forEach(chk => chk.checked = true);
  }

  render() {
    const p = this.state.opacity;
    
    // Apply background colors to regions dynamically
    const applyStyle = (el, key) => {
      const cls = this.state.classes[key];
      if (cls.visible) {
        el.style.backgroundColor = cls.color.replace('opacity', p);
        el.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        el.style.color = '#ffffff';
      } else {
        el.style.backgroundColor = 'transparent';
        el.style.borderColor = 'transparent';
        el.style.color = 'transparent';
      }
    };

    applyStyle(this.skyRegion, 'sky');
    applyStyle(this.buildingRegion, 'building');
    applyStyle(this.roadRegion, 'road');
    applyStyle(this.carRegion, 'car');
  }
}
