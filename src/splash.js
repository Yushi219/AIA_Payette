function navigateTo(view) {
  if (view === 'map') return; // 如果是 Boston Map，不跳转

  const isDesktop = window.innerWidth >= 1000;
  const base = isDesktop ? 'project_index.html' : 'project_index_mobile.html';
  window.location.href = `${base}?view=${view}`; // 跳转并附带 view 参数
}

function updateActiveButton(viewType) {
  const buttons = ['map', 'info', 'awards', 'leed'];
  buttons.forEach(btn => {
    const element = document.getElementById(`${btn}-btn`);
    if (element) {
      element.style.color = (btn === viewType) ? '#db1a54' : '#333129'; // 使用你指定的粉色
    }
  });
}

function openMap(url) {
  // 创建弹窗容器
  const popup = document.createElement('div');
  popup.classList.add('map-popup');
  popup.innerHTML = `
    <div class="popup-content">
      <button class="popup-close" onclick="document.body.removeChild(this.parentElement.parentElement)">✖</button>
      <div class="popup-message">
        <p>Open location in Google Maps?</p>
        <button class="popup-open-btn">Go to Google Map</button>
      </div>
    </div>
  `;

  // 点击背景关闭
  popup.addEventListener('click', function (e) {
    if (e.target === popup) document.body.removeChild(popup);
  });

  // 绑定跳转逻辑
  popup.querySelector('.popup-open-btn').addEventListener('click', function () {
    window.open(url, '_blank');
    document.body.removeChild(popup);
  });

  document.body.appendChild(popup);
}



async function setupBuildingLabelClicks() {
  try {
    const res = await fetch('public/MapLinks.json'); // 如果放在 public 文件夹
    const mapLinks = await res.json();

    Object.keys(mapLinks).forEach(labelId => {
      const label = document.getElementById(labelId);
      if (!label) return;

      const link = mapLinks[labelId];

      // 让 title 和 subtitle 都能点击
      label.style.cursor = 'pointer';
      label.addEventListener('click', () => {
        console.log("Opening map with URL:", link);  // 检查点击是否生效
        openMap(link);
      });
      
    });
  } catch (err) {
    console.error('Failed to load map links:', err);
  }


}




document.addEventListener('DOMContentLoaded', function () {
  setupBuildingLabelClicks();

  // 初始化所有建筑元素并隐藏
  const buildings = [];
  for (let i = 0; i <= 12; i++) {
    const building = document.getElementById(`building${i}`);
    if (building) {
      building.classList.remove('visible');
      buildings.push(building);
    }
    
  }

  const payetteLogo = document.getElementById('payetteLogo');
  if (payetteLogo) {
    payetteLogo.classList.remove('visible');
    payetteLogo.dataset.isLogo = 'true'; // ✅ 标记为 logo，用于后续排除
    buildings.push(payetteLogo);
  
    // ✅ 只在此处设置点击跳转为外链
    payetteLogo.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止触发其他事件
      window.open('https://www.payette.com', '_blank');
    });
  }
  


  
  updateActiveButton('map'); 
  
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

  function adjustContainerHeight() {
    const mapImage = document.querySelector('#map img:first-child');
    if (!mapImage.complete || mapImage.naturalWidth === 0 || mapImage.naturalHeight === 0) {
      mapImage.onload = () => adjustContainerHeight();
      return;
    }
  
    const imageWidth = mapImage.naturalWidth;
    const imageHeight = mapImage.naturalHeight;
    const aspectRatio = imageHeight / imageWidth;
  
    if (isDesktop) {
      // 桌面模式
      const containerWidth = window.innerWidth;
      const containerHeight = containerWidth * aspectRatio;
  
      mapContainer.style.width = `${containerWidth}px`;
      mapContainer.style.height = `${containerHeight}px`;
  
      map.style.width = '100%';
      map.style.height = '100%';
      map.style.transform = 'none';
  
      mapContainer.scrollLeft = 0; // scroll 到最左侧
    } else {
      // 移动模式
      const containerHeight = window.innerHeight * 0.8;
      const aspectRatio = mapImage.naturalWidth / mapImage.naturalHeight;
      const mapDisplayWidth = containerHeight * aspectRatio;
    
      // 容器宽度仍然是手机屏幕宽度
      const containerWidth = window.innerWidth;
    
      // 设置容器尺寸
      mapContainer.style.height = `${containerHeight}px`;
      mapContainer.style.width = `${containerWidth}px`;
      mapContainer.style.overflowX = 'auto';
      mapContainer.style.overflowY = 'hidden';
    
      // 设置地图尺寸：高度固定，宽度自动等比例拉伸
      map.style.height = '100%';
      map.style.width = `${mapDisplayWidth}px`; // 关键：等比例放大
      map.style.transform = 'none';
    
      // 自动滚动到地图中心
      setTimeout(() => {
        const scrollWidth = mapContainer.scrollWidth;
        const visibleWidth = mapContainer.clientWidth;
        const centerScroll = (scrollWidth - visibleWidth) / 2;
        mapContainer.scrollLeft = centerScroll;
      }, 50);
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


  // 限制平移范围，确保地图边缘贴合容器
  function DlimitTranslation() {

    const rect = map.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();

    const maxTranslateX = Math.max(0, (rect.width - containerRect.width) / 2);
    const maxTranslateY = Math.max(0, (rect.height - containerRect.height) / 2);

    translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
    translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
  }


  // ✅ 桌面模式横向滚动地图（鼠标滚轮 => 向右滑动）
  mapContainer.addEventListener('wheel', function (event) {
    if (!isDesktop) return;

    const maxScrollLeft = mapContainer.scrollWidth - mapContainer.clientWidth;

    if (
      (event.deltaY > 0 && mapContainer.scrollLeft < maxScrollLeft) ||
      (event.deltaY < 0 && mapContainer.scrollLeft > 0)
    ) {
      event.preventDefault(); // 阻止页面滚动
      mapContainer.scrollLeft += event.deltaY;
    }
  });

  // ✅ 移动模式横向滑动地图（手指拖动 => 向右滑动）
  let startTouchX = 0;
  let startScrollLeft = 0;

  mapContainer.addEventListener('touchstart', function (event) {
    if (isDesktop || event.touches.length !== 1) return;
    startTouchX = event.touches[0].clientX;
    startScrollLeft = mapContainer.scrollLeft;
  }, { passive: true });

  mapContainer.addEventListener('touchmove', function (event) {
    if (isDesktop || event.touches.length !== 1) return;
    const touchX = event.touches[0].clientX;
    const deltaX = startTouchX - touchX;
    const maxScrollLeft = mapContainer.scrollWidth - mapContainer.clientWidth;

    if ((deltaX > 0 && mapContainer.scrollLeft < maxScrollLeft) ||
        (deltaX < 0 && mapContainer.scrollLeft > 0)) {
      event.preventDefault(); // 阻止页面跟随拖动
      mapContainer.scrollLeft = startScrollLeft + deltaX;
    }
  }, { passive: false });

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
        event.preventDefault();
    }
  });

  // 触摸移动事件
  mapContainer.addEventListener('touchmove', (event) => {
    if (isDesktop) return; // 如果是桌面模式，退出
    event.preventDefault(); // 阻止默认滚动行为    
  
    if (event.touches.length === 1 && isDragging) {
      const touch = event.touches[0];
      buildings.forEach(building => toggleTouchVisibility(touch, building));
      return;
 
    } else if (event.touches.length === 2) {
      event.preventDefault(); // 阻止缩放
      return;
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
  // 将 payette-section 当作按钮
  const payetteSection = document.getElementById('payette-section');
  payetteSection.addEventListener('click', () => {
    const isDesktop = window.innerWidth >= 1000;
    const url = isDesktop ? 'project_index.html' : 'project_index_mobile.html';
    window.location.href = url;
  });

/////////////////////////////////  


  // 为建筑物绑定移动端点击判断和 hover 替换逻辑
  buildings.forEach((building, index) => {
    if (!building) return;

    let touchStartTime = 0;
    let startX = 0;
    let startY = 0;

    // 记录 touch 起点
    building.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartTime = Date.now();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    // 判断是否为轻点（非滑动）
    building.addEventListener('touchend', (e) => {
      const touchEndTime = Date.now();
      const duration = touchEndTime - touchStartTime;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (duration < 300 && distance < 10) {
        let relatedID;
        if (index === 9) relatedID = 3;
        else if (index === 10) relatedID = 2;
        else if (index === 11) relatedID = 6;

        const base = isDesktop ? 'project_index.html' : 'project_index_mobile.html';
        const url = relatedID
          ? `${base}?id=${index + 1}&related=${relatedID}`
          : `${base}?id=${index + 1}`;
        window.location.href = url;
        showLoadingOverlay();
      }
    });
  });

  // 桌面模式点击跳转逻辑
  buildings.forEach((building, index) => {
    if (building.dataset.isLogo === 'true') return; // ✅ 跳过 logo

    building.addEventListener('click', () => {
      if (!isDesktop) return;

      let relatedID;
      if (index === 9) relatedID = 3;
      else if (index === 10) relatedID = 2;
      else if (index === 11) relatedID = 6;

      const url = relatedID
        ? `project_index.html?id=${index + 1}&related=${relatedID}`
        : `project_index.html?id=${index + 1}`;

      window.location.href = url;
      showLoadingOverlay();
    });
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

  function fadeIn(element) {
    element.classList.add('visible');
  }
  
  function fadeOut(element) {
    element.classList.remove('visible');
  }
  

  function toggleVisibility(event, element) {
    const rect = element.getBoundingClientRect();
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      fadeIn(element);
    } else {
      fadeOut(element);
    }
  }
  
  
  function toggleTouchVisibility(touch, element) {
    const rect = element.getBoundingClientRect();
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      fadeIn(element);
    } else {
      fadeOut(element);
    }
  }
  


  // 页面加载时隐藏加载动画
  window.onload = function () {
    hideLoadingOverlay();
  };

});
