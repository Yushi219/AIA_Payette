document.addEventListener('DOMContentLoaded', function () {
  const desktopModeBtn = document.getElementById('desktop-mode-btn');
  const mobileLandscapeModeBtn = document.getElementById('mobile-landscape-mode-btn');
  const mapContainer = document.getElementById('map-container');
  const map = document.getElementById('map');
  const mapImage = document.querySelector('#map img:first-child');
  let scale = 1; // 初始缩放比例
  let translateX = 0; // X方向平移
  let translateY = 0; // Y方向平移

  // 调整地图容器和显示范围
  function adjustContainerHeight(mode) {
      if (mapImage && mapImage.naturalWidth > 0 && mapImage.naturalHeight > 0) {
          const imageWidth = mapImage.naturalWidth; // 图片实际宽度
          const imageHeight = mapImage.naturalHeight; // 图片实际高度

          if (mode === 'mobile') {
              // 设置显示范围比例
              const startRatio = 1 / 4; // 开始比例
              const endRatio = 3 / 4; // 结束比例
              const visibleRatio = endRatio - startRatio; // 可见范围比例

              const containerWidth = window.innerWidth; // 容器宽度为屏幕宽度
              scale1 = containerWidth / (visibleRatio * imageWidth); // 计算缩放比例
              scale = 3;

              // 设置容器高度为缩放后的图片高度
              const scaledHeight = imageHeight * scale1 + 150; // 缩放后的地图高度
              mapContainer.style.width = `${containerWidth}px`;
              mapContainer.style.height = `${scaledHeight}px`;

              // 调整地图平移以居中显示目标范围
              translateX = 0; // 水平方向平移到目标起点
              translateY = 150; // 垂直方向保持不变
              map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          } else {
              // Desktop mode: 恢复默认布局
              const aspectRatio = imageHeight / imageWidth;
              mapContainer.style.height = `${mapContainer.offsetWidth * aspectRatio}px`;
              mapContainer.style.width = ''; // 宽度默认
              scale = 1.2;
              translateX = 0;
              translateY = 0;
              map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          }
      }
  }

  // 更新模式样式
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

      // 调整地图容器高度
      adjustContainerHeight(mode);
  }

  // 设置默认模式
  function setDefaultMode() {
      const mode = window.innerWidth < 900 ? 'mobile' : 'desktop';
      localStorage.setItem('viewMode', mode);
      updateModeUI(mode);
  }

  // 绑定按钮点击事件
  desktopModeBtn.addEventListener('click', () => {
      localStorage.setItem('viewMode', 'desktop');
      updateModeUI('desktop');
      alert('Switched to Desktop Mode');
  });

  mobileLandscapeModeBtn.addEventListener('click', () => {
      localStorage.setItem('viewMode', 'mobile');
      updateModeUI('mobile');
      alert('Switched to Mobile Mode');
  });

  // 图片加载完成后设置高度
  if (mapImage) {
      mapImage.onload = function () {
          const mode = localStorage.getItem('viewMode') || (window.innerWidth < 900 ? 'mobile' : 'desktop');
          adjustContainerHeight(mode);
      };
  }

  // 监听窗口大小变化，动态调整模式和容器高度
  window.addEventListener('resize', function () {
      const mode = window.innerWidth < 900 ? 'mobile' : 'desktop';
      localStorage.setItem('viewMode', mode);
      updateModeUI(mode);
  });

  // 页面加载时设置默认模式
  setDefaultMode();


  //////////////////////////////////////////////////
  let isDragging = false; // 是否正在拖拽
  let startX, startY; // 鼠标初始位置

  // 设置初始光标样式
  mapContainer.style.cursor = 'grab';

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
    toggleVisibility(event, payetteL);
    
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
