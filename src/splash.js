document.addEventListener('DOMContentLoaded', function () {
  const mapContainer = document.getElementById('map-container');
  const mapImage = document.querySelector('#map img:first-child');
  const map = document.getElementById('map');
  let scale = 1.2; // 初始缩放比例
  let translateX = 0; // X方向平移
  let translateY = 4 * window.innerHeight / 100; // Y方向平移
  let isDragging = false; // 是否正在拖拽
  let startX, startY; // 鼠标初始位置

  // 设置初始光标样式
  mapContainer.style.cursor = 'grab';

  // 函数：根据图片比例动态调整容器高度
  function adjustContainerHeight() {
    const aspectRatio = mapImage.naturalHeight / mapImage.naturalWidth; // 图片宽高比
    mapContainer.style.height = `${mapContainer.offsetWidth * aspectRatio}px`; // 根据比例动态调整高度
  }

  // 在图片加载完成后设置初始高度
  mapImage.onload = function () {
    adjustContainerHeight(); // 页面加载时调整高度
  };

  // 监听窗口大小变化，动态调整容器高度
  window.addEventListener('resize', adjustContainerHeight);

  window.addEventListener('pageshow', function () {
    const mapContainer = document.getElementById('map-container');
    const mapImage = document.querySelector('#map img:first-child');
    
    // 重新调整容器高度
    const aspectRatio = mapImage.naturalHeight / mapImage.naturalWidth;
    mapContainer.style.height = `${mapContainer.offsetWidth * aspectRatio}px`;
  });  



  // 限制平移范围，确保地图边缘贴合容器
  function limitTranslation() {
    const rect = map.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();

    const maxTranslateX = Math.max(0, (rect.width - containerRect.width) / 2);
    const maxTranslateY = Math.max(0, (rect.height - containerRect.height) / 2);

    translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
    translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
  }

  // 鼠标按下时开启拖拽模式
  mapContainer.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return; // 仅响应左键
    event.preventDefault();
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    mapContainer.style.cursor = 'grabbing';
  });

  const moveSpeed = 1.5; // 添加一个速率系数，默认值为 1

  mapContainer.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
  
    const dx = event.clientX - startX; // 鼠标移动的X距离
    const dy = event.clientY - startY; // 鼠标移动的Y距离
  
    translateX += (dx / scale) * moveSpeed; // 调整X方向平移速率
    translateY += (dy / scale) * moveSpeed; // 调整Y方向平移速率
  
    limitTranslation();
  
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  
    startX = event.clientX;
    startY = event.clientY;
  });
  

  // 鼠标松开时停止拖拽
  mapContainer.addEventListener('mouseup', () => {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  // 鼠标移出容器时停止拖拽
  mapContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  // 鼠标滚轮缩放地图
  mapContainer.addEventListener('wheel', function (event) {
    event.preventDefault();

    const zoomSpeed = 0.1;
    const zoomIn = event.deltaY < 0;
    const oldScale = scale;
    scale = zoomIn ? scale + zoomSpeed : scale - zoomSpeed;

    // 限制缩放比例
    scale = Math.min(Math.max(scale, 1.2), 5);

    // 获取鼠标在容器中的位置
    const containerRect = mapContainer.getBoundingClientRect();
    const mouseX = event.clientX - containerRect.left; // 鼠标相对容器的X坐标
    const mouseY = event.clientY - containerRect.top; // 鼠标相对容器的Y坐标

    // 转换鼠标位置为地图的缩放点
    const rect = map.getBoundingClientRect();
    const offsetX = mouseX - rect.left; // 鼠标相对地图的X偏移
    const offsetY = mouseY - rect.top; // 鼠标相对地图的Y偏移

    // 更新平移值，以保持鼠标位置为缩放中心
    translateX -= (offsetX / oldScale) * (scale - oldScale);
    translateY -= (offsetY / oldScale) * (scale - oldScale);

    // 如果边缘触碰容器，则调整平移值
    limitTranslation();

    // 应用缩放和平移
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  });


  ////////////////////////////////////
  const desktopModeBtn = document.getElementById('desktop-mode-btn');
  const mobileLandscapeModeBtn = document.getElementById('mobile-landscape-mode-btn');



  // 检测屏幕宽度并设置默认模式
  function setDefaultMode() {
    const mode = localStorage.getItem('viewMode');
    if (!mode) {
      if (window.innerWidth < 900) {
        localStorage.setItem('viewMode', 'mobile');
        updateModeUI('mobile');
      } else {
        localStorage.setItem('viewMode', 'desktop');
        updateModeUI('desktop');
      }
    } else {
      updateModeUI(mode);
    }
  }

  // 更新按钮状态和样式
  function updateModeUI(mode) {
    if (mode === 'mobile') {
      document.body.classList.add('mobile-mode');
      document.body.classList.remove('desktop-mode');
      mobileLandscapeModeBtn.style.backgroundColor = 'gray';
      desktopModeBtn.style.backgroundColor = '';
    } else {
      document.body.classList.add('desktop-mode');
      document.body.classList.remove('mobile-mode');
      desktopModeBtn.style.backgroundColor = 'gray';
      mobileLandscapeModeBtn.style.backgroundColor = '';
    }
  }

  // 点击电脑模式按钮
  desktopModeBtn.addEventListener('click', () => {
    localStorage.setItem('viewMode', 'desktop');
    updateModeUI('desktop');
    alert('Switched to Desktop Mode');
  });

  // 点击手机模式按钮
  mobileLandscapeModeBtn.addEventListener('click', () => {
    localStorage.setItem('viewMode', 'mobile');
    updateModeUI('mobile');
    alert('Switched to Mobile Landscape Mode');
  });

  // 跳转到相应的 Dashboard
  const wood = document.getElementById('wood'); // Wood image
  const pen = document.getElementById('pen'); // Pen image

  // Left and right sensor areas
  const leftSensor = document.getElementById('left-sensor');
  const rightSensor = document.getElementById('right-sensor');

  wood.addEventListener('click', function () {
    const mode = localStorage.getItem('viewMode') || 'desktop';
    const url = mode === 'mobile' ? 'computational_index_mobile.html' : 'computational_index.html';
    window.location.href = url; // 跳转到 Computational Design Dashboard
  });

  pen.addEventListener('click', function () {
    const mode = localStorage.getItem('viewMode') || 'desktop';
    const url = mode === 'mobile' ? 'project_index_mobile.html' : 'project_index.html';
    window.location.href = url; // 跳转到 Project Dashboard
  });

  // Initialize all building elements and hide them initially
  const buildings = [];
  for (let i = 0; i <= 12; i++) {
    const building = document.getElementById(`building${i}`);
    if (building) {
      building.style.visibility = 'hidden'; // Start hidden
      buildings.push(building);
    }
  }

  // 鼠标进入左边区域时显示 pen
  leftSensor.addEventListener('mouseenter', function () {
    pen.style.visibility = 'visible';
    wood.style.visibility = 'hidden'; // 隐藏 wood
  });

  // 鼠标进入右边区域时显示 wood
  rightSensor.addEventListener('mouseenter', function () {
    wood.style.visibility = 'visible';
    pen.style.visibility = 'hidden'; // 隐藏 pen
  });

  // 当鼠标离开整个 payette section 时重置图片的显示状态
  document.getElementById('payette-section').addEventListener('mouseleave', function () {
    wood.style.visibility = 'hidden';
    pen.style.visibility = 'hidden';
  });

  buildings.forEach((building, index) => {
    if (building) {
      building.addEventListener('click', function () {
        // Check if the current building has a related ID
        let relatedID;
        if (index === 9) relatedID = 3;
        else if (index === 10) relatedID = 2;
        else if (index === 11) relatedID = 6;

        const mode = localStorage.getItem('viewMode') || 'desktop';
        const base = mode === 'mobile' ? 'project_index_mobile.html' : 'project_index.html';
        const url = relatedID
          ? `${base}?id=${index + 1}&related=${relatedID}`
          : `${base}?id=${index + 1}`;
        window.location.href = url;
        showLoadingOverlay();
      });
    }
  });

  // Show loading overlay
  function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
  }

  // Hide loading overlay
  function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
  }

  // 鼠标移动时显示/隐藏建筑物图片
  document.getElementById('splash-container').addEventListener('mousemove', function (event) {
    buildings.forEach(building => {
      toggleVisibility(event, building);
    });
  });

  // 根据鼠标位置切换建筑图片显示状态
  function toggleVisibility(event, element) {
    const rect = element.getBoundingClientRect();
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      element.style.visibility = 'visible';
    } else {
      element.style.visibility = 'hidden';
    }
  }

  // 页面加载时设置默认模式
  setDefaultMode();

  window.onload = function () {
    hideLoadingOverlay();
  };
});
