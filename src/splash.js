document.addEventListener('DOMContentLoaded', function () {
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
