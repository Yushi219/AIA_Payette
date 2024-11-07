document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize all building elements and hide them initially
  const buildings = [];
  for (let i = 0; i <= 12; i++) {
    const building = document.getElementById(`building${i}`);
    if (building) {
      building.style.visibility = 'hidden'; // Start hidden
      buildings.push(building);
    }
  }

  const wood = document.getElementById('wood'); // Wood image
  const pen = document.getElementById('pen'); // Pen image

  // Left and right sensor areas
  const leftSensor = document.getElementById('left-sensor');
  const rightSensor = document.getElementById('right-sensor');

  wood.addEventListener('click', function() {
    window.location.href = 'computational_index.html'; // 跳转到 Computational Design Dashboard
  });
  
  pen.addEventListener('click', function() {
    window.location.href = 'project_index.html'; // 跳转到 Project Dashboard
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


  // 鼠标进入左边区域时显示 pen
  leftSensor.addEventListener('mouseenter', function() {
    pen.style.visibility = 'visible';
    wood.style.visibility = 'hidden'; // 隐藏 wood
  });

  // 鼠标进入右边区域时显示 wood
  rightSensor.addEventListener('mouseenter', function() {
    wood.style.visibility = 'visible';
    pen.style.visibility = 'hidden'; // 隐藏 pen
  });

  // 当鼠标离开整个 payette section 时重置图片的显示状态
  document.getElementById('payette-section').addEventListener('mouseleave', function() {
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

        const url = relatedID 
            ? `project_index.html?id=${index + 1}&related=${relatedID}` 
            : `project_index.html?id=${index + 1}`;
        window.location.href = url;
        showLoadingOverlay();

      });
    }
  });
  
  // 鼠标移动时显示/隐藏建筑物图片
  document.getElementById('splash-container').addEventListener('mousemove', function(event) {
    buildings.forEach(building => {
      toggleVisibility(event, building);
    });
  });

  // 根据鼠标位置切换建筑图片显示状态
  function toggleVisibility(event, element) {
    const rect = element.getBoundingClientRect();
    if (event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom) {
      element.style.visibility = 'visible';
    } else {
      element.style.visibility = 'hidden';
    }
  }

  window.onload = function() {
    hideLoadingOverlay();
  };
});

