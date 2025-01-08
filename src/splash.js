document.addEventListener('DOMContentLoaded', function () {
  const toggleCircle = document.getElementById('toggle-circle');
  const toggleIcon = document.getElementById('toggle-icon');
  const desktopLabel = document.getElementById('desktop-label');
  const mobileLabel = document.getElementById('mobile-label');
  const modeSelection = document.querySelector('.toggle-container');
  const mapContainer = document.getElementById('map-container');
  const map = document.getElementById('map');
  const mapImage = document.querySelector('#map img:first-child');

  let scale = 1; // 初始缩放比例
  let translateX = 0; // X方向平移
  let translateY = 0; // Y方向平移
  let isDesktop = true; // 默认模式为桌面

  function initMode() {
    // 根据屏幕宽度或保存的模式动态设置 isDesktop
    const savedMode = localStorage.getItem('viewMode');
    if (savedMode) {
      isDesktop = savedMode === 'desktop';
    } else {
      isDesktop = window.innerWidth >= 1000; // 自动判断：大于等于 1000 为桌面模式
    }
  
    updateToggleUI(); // 更新 UI
    adjustContainerHeight(); // 调整地图容器高度

  }


  function toggleMode() {
    isDesktop = !isDesktop; // 切换模式
    updateToggleUI(); // 更新 UI
    adjustContainerHeight(); // 调整地图容器高度
  
    const mode = isDesktop ? 'desktop' : 'mobile';
    alert(`Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`);
  }
  
  // 页面加载时初始化
  window.onload = function () {
    ensureImageLoaded();
    setDefaultMode();
  };
    
  initMode();

  // 调整地图容器和显示范围
  function adjustContainerHeight() {
    // 如果图片未完全加载，则等待加载完成
    if (!mapImage.complete || mapImage.naturalWidth === 0 || mapImage.naturalHeight === 0) {
      mapImage.onload = function () {
        adjustContainerHeight(); // 图片加载完成后重新调整
      };
      return;
    }
  
    const imageWidth = mapImage.naturalWidth;
    const imageHeight = mapImage.naturalHeight;
  
    if (isDesktop) {
      // 桌面模式
      const aspectRatio = imageHeight / imageWidth;
      mapContainer.style.height = `${mapContainer.offsetWidth * aspectRatio}px`;
      scale = 1.2;
      translateX = 0;
      translateY = 0;
      map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    } else {
      // 移动模式
      const containerWidth = window.innerWidth;
      const scale1 = containerWidth / (imageWidth * 0.5);
      scale = 3;
  
      const scaledHeight = imageHeight * scale1 + 150;
      mapContainer.style.width = `${containerWidth}px`;
      mapContainer.style.height = `${scaledHeight}px`;
  
      translateX = 0;
      translateY = 150;
      map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

  }
  


  function updateToggleUI() {
    if (isDesktop) {
      toggleCircle.style.left = '130px'; // 圆圈移动到右侧
      modeSelection.style.background = 'linear-gradient(to right, #b4b4b4, #ffffff)'; // 深到浅背景
      toggleIcon.src = './public/Desktop.png'; // 图标更新为 Desktop
      desktopLabel.style.color = '#ffffff'; // Desktop 文本变白
      desktopLabel.style.opacity = '1'; // Desktop 文本可见
      mobileLabel.style.color = '#ffffff'; // Mobile 文本为白色
      mobileLabel.style.opacity = '0'; // Mobile 文本隐藏
    } else {
      toggleCircle.style.left = '5px'; // 圆圈移动到左侧
      modeSelection.style.background = 'linear-gradient(to left, #b4b4b4, #ffffff)'; // 浅到深背景
      toggleIcon.src = './public/Mobile.png'; // 图标更新为 Mobile
      desktopLabel.style.color = '#ffffff'; // Desktop 文本为白色
      desktopLabel.style.opacity = '0'; // Desktop 文本隐藏
      mobileLabel.style.color = '#ffffff'; // Mobile 文本变白
      mobileLabel.style.opacity = '1'; // Mobile 文本可见
    }
  
    // 调整地图容器大小
    adjustContainerHeight();
  
    localStorage.setItem('viewMode', isDesktop ? 'desktop' : 'mobile'); // 保存模式
  }
  


  // 点击切换事件
  modeSelection.addEventListener('click', toggleMode);


////////////////////////////////


  // 检查图片加载完成
  function ensureImageLoaded() {
    if (mapImage.complete && mapImage.naturalWidth > 0) {
      adjustContainerHeight();
    } else {
      mapImage.onload = function () {
        adjustContainerHeight();
      };
    }
  }
  


  // 监听窗口大小变化，动态调整模式
  window.addEventListener('resize', function () {
    adjustContainerHeight(isDesktop ? 'desktop' : 'mobile');
  });


  // 自动检测屏幕宽度并设置默认模式
  function setDefaultMode() {
    const detectedMode = window.innerWidth < 1000 ? 'mobile' : 'desktop';
    isDesktop = detectedMode === 'desktop'; // 更新全局变量
    updateToggleUI(); // 更新按钮和页面样式
    adjustContainerHeight(); // 自动检测模式后调整地图容器大小
  }
  



  // 监听窗口大小变化，动态调整模式和容器高度
  window.addEventListener('resize', function () {
    adjustContainerHeight();
  });


  // 页面加载时设置默认模式
  setDefaultMode();


  //////////////////////////////////////////////////
  //Desktop Mode Move Map
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


  // 限制平移范围，确保地图边缘贴合容器
  function DlimitTranslation() {

    const rect = map.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();

    const maxTranslateX = Math.max(0, (rect.width - containerRect.width) / 2);
    const maxTranslateY = Math.max(0, (rect.height - containerRect.height) / 2);

    translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
    translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
  }

  // 鼠标按下时开启拖拽模式
  mapContainer.addEventListener('mousedown', (event) => {
    if (!isDesktop) return; // 如果不是桌面模式，退出
    if (event.button !== 0) return; // 仅响应左键
    event.preventDefault();
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    mapContainer.style.cursor = 'grabbing';
  });

  const moveSpeed = 1.5; // 添加一个速率系数，默认值为 1

  mapContainer.addEventListener('mousemove', (event) => {
    if (!isDesktop || !isDragging) return; // 如果不是桌面模式或未拖拽，退出
    if (!isDragging) return;
  
    const dx = event.clientX - startX; // 鼠标移动的X距离
    const dy = event.clientY - startY; // 鼠标移动的Y距离
  
    translateX += (dx / scale) * moveSpeed; // 调整X方向平移速率
    translateY += (dy / scale) * moveSpeed; // 调整Y方向平移速率
  
    DlimitTranslation();
  
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  
    startX = event.clientX;
    startY = event.clientY;
  });
  

  // 鼠标松开时停止拖拽
  mapContainer.addEventListener('mouseup', () => {
    if (!isDesktop) return; // 如果不是桌面模式，退出
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
    if (!isDesktop) return; // 如果不是桌面模式，退出
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
    DlimitTranslation();

    // 应用缩放和平移
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  });

//////////////////////////////////////////////////
//Mobile Mode Move Map
  // 移动端地图逻辑
  const MIN_SCALE = 3; // 桌面和移动端的最小缩放比例
  const MAX_SCALE = 8; // 最大缩放比例
  let initialDistance = 0; // 双指缩放初始距离
  let initialScale = 1; // 双指缩放初始比例
  let isTouching = false; // 是否正在触摸（防止移动过程中地图消失）

  // 禁用默认触摸行为
  mapContainer.style.touchAction = 'none';

  // 计算双指之间的距离
  function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
  }

  // 限制平移范围，确保地图边缘贴合容器
  function MlimitTranslation() {
    const rect = map.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();

    // 计算容器的额外高度偏移
    const extraHeightOffset = 150; // 容器高度增加的偏移量
    const defaultTranslateY = 315; // 默认的初始 translateY 偏移量

    const maxTranslateX = Math.max(0, (rect.width - containerRect.width) / 2);
    const maxTranslateY = Math.max(0, (rect.height - containerRect.height) / 2 + extraHeightOffset);

    // 限制平移范围
    translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
    translateY = Math.max(-maxTranslateY + defaultTranslateY, Math.min(maxTranslateY, translateY));
  }



  // 触摸开始事件
  mapContainer.addEventListener('touchstart', (event) => {
    if (isDesktop) return; // 如果是桌面模式，退出
    isTouching = true; // 标记触摸开始
    if (event.touches.length === 1) {
        // 单指拖拽
        isDragging = true;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
        // 双指缩放
        isDragging = false; // 停止拖拽模式
        initialDistance = getDistance(event.touches);
        initialScale = scale;
    }
  });

  // 触摸移动事件
  mapContainer.addEventListener('touchmove', (event) => {
    if (isDesktop) return; // 如果是桌面模式，退出
    event.preventDefault(); // 阻止默认滚动行为
  
    if (event.touches.length === 1 && isDragging) {
      // 单指拖拽逻辑
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
  
      const moveSpeed = 2; // 调整单指移动速度
      translateX += (dx / scale) * moveSpeed;
      translateY += (dy / scale) * moveSpeed;
  
      MlimitTranslation();
  
      map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // 双指缩放逻辑
      const currentDistance = getDistance(event.touches);
      const scaleChange = currentDistance / initialDistance;
  
      // 调整缩放速度（降低缩放敏感度）
      const zoomSpeed = 0.8; // 缩放速度系数
      const newScale = Math.min(Math.max(initialScale * Math.pow(scaleChange, zoomSpeed), MIN_SCALE), MAX_SCALE);
  
      // 计算两个触点的中心作为缩放中心
      const touchCenterX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const touchCenterY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
  
      const containerRect = mapContainer.getBoundingClientRect();
      const mapRect = map.getBoundingClientRect();
  
      const relativeCenterX = touchCenterX - containerRect.left;
      const relativeCenterY = touchCenterY - containerRect.top;
  
      const offsetX = relativeCenterX - (mapRect.left - containerRect.left + mapRect.width / 2);
      const offsetY = relativeCenterY - (mapRect.top - containerRect.top + mapRect.height / 2);
  
      // 调整平移值以保持缩放中心为触点中心
      translateX -= (offsetX / scale) * (newScale - scale);
      translateY -= (offsetY / scale) * (newScale - scale);
  
      scale = newScale;
  
      MlimitTranslation();
  
      map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
  });
  

  // 触摸结束事件
  mapContainer.addEventListener('touchend', (event) => {
    if (isDesktop) return; // 如果是桌面模式，退出
    if (event.touches.length === 0) {
        isDragging = false;
        isTouching = false; // 触摸结束，标记为非触摸状态
    }
  });

  // 防止地图移动过程中消失的问题
  mapContainer.addEventListener('touchcancel', () => {
    isTouching = false;
    isDragging = false;
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  });



  ////////////////////////////////////
  // 跳转到相应的 Dashboard
  const wood = document.getElementById('wood'); // Wood image
  const pen = document.getElementById('pen'); // Pen image

  // 左右传感器区域
  const leftSensor = document.getElementById('left-sensor');
  const rightSensor = document.getElementById('right-sensor');

  // 动态跳转逻辑
  function navigateToDashboard(type) {
    const url = isDesktop
      ? (type === 'computational' ? 'computational_index.html' : 'project_index.html')
      : (type === 'computational' ? 'computational_index_mobile.html' : 'project_index_mobile.html');
    window.location.href = url; // 跳转到对应页面
  }

  // 点击事件绑定
  wood.addEventListener('click', () => navigateToDashboard('computational')); // 点击 Wood 跳转到 Computational Design Dashboard
  pen.addEventListener('click', () => navigateToDashboard('project')); // 点击 Pen 跳转到 Project Dashboard

  // 初始化所有建筑元素并隐藏
  const buildings = [];
  for (let i = 0; i <= 12; i++) {
    const building = document.getElementById(`building${i}`);
    if (building) {
      building.style.visibility = 'hidden'; // 初始隐藏
      buildings.push(building);
    }
  }

  // 鼠标进入左侧区域时显示 Pen
  leftSensor.addEventListener('mouseenter', function () {
    pen.style.visibility = 'visible';
    wood.style.visibility = 'hidden'; // 隐藏 Wood
  });

  // 鼠标进入右侧区域时显示 Wood
  rightSensor.addEventListener('mouseenter', function () {
    wood.style.visibility = 'visible';
    pen.style.visibility = 'hidden'; // 隐藏 Pen
  });

  // 鼠标离开 Payette 区域时重置图片显示状态
  document.getElementById('payette-section').addEventListener('mouseleave', function () {
    wood.style.visibility = 'hidden';
    pen.style.visibility = 'hidden';
  });

  // 为建筑物绑定跳转逻辑
  buildings.forEach((building, index) => {
    if (building) {
      building.addEventListener('click', function () {
        // 检查是否有相关 ID
        let relatedID;
        if (index === 9) relatedID = 3;
        else if (index === 10) relatedID = 2;
        else if (index === 11) relatedID = 6;

        const base = isDesktop ? 'project_index.html' : 'project_index_mobile.html';
        const url = relatedID
          ? `${base}?id=${index + 1}&related=${relatedID}`
          : `${base}?id=${index + 1}`;
        window.location.href = url; // 跳转到相应页面
        showLoadingOverlay();
      });
    }
  });

  // 显示加载动画
  function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
  }

  // 隐藏加载动画
  function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
  }

  // 鼠标移动时动态显示/隐藏建筑物图片
  document.getElementById('splash-container').addEventListener('mousemove', function (event) {
    buildings.forEach(building => toggleVisibility(event, building));
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

  // 页面加载时隐藏加载动画
  window.onload = function () {
    hideLoadingOverlay();
  };

});
