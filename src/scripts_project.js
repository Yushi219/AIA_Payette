document.addEventListener('DOMContentLoaded', function() { 
  
  // 设置人物初始位置为起始点
    const minLeft = 10; // 起始位置为 20vw
    personImage.style.left = `calc(${minLeft}vw)`;  // 初始位置为 20vw
    //personImage.src = imageStill[0]; // 设置为 S1 图片

    const computationalBtn = document.getElementById('computational-dashboard-btn');
    const projectBtn = document.getElementById('project-dashboard-btn');
  
    // 从 URL 获取 dashboard 参数
    const urlParams = new URLSearchParams(window.location.search);
    let currentDashboard = urlParams.get('dashboard') || 'project'; // Default to Project Dashboard
  
  
    // 点击按钮跳转到相应的 index 页面
    computationalBtn.addEventListener('click', () => {
      // showLoadingOverlay();
      window.location.href = 'computational_index.html';  // 跳转到 Computational Design Dashboard 页面
    });
  
    projectBtn.addEventListener('click', () => {
      // showLoadingOverlay();
      window.location.href = 'project_index.html';  // 跳转到 Project Dashboard 页面
    });
  

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

////////////////////////////////////////
  // Updated People Move Interaction
  const projectList = document.getElementById('project-list');
  const personImage = document.getElementById('person-image');
  const searchInput = document.getElementById('search-input');
  let isFilterActive = false;
  let isSearchActive = false;

  // Define images and GIFs
  const standingStart = 'public/S1.png';
  const standingEnd = 'public/S3.png';
  const centeredImage = 'public/S2.png';
  const movingRightGif = 'public/R.gif';
  const movingLeftGif = 'public/L.gif';

  // Function to set the person image based on scroll direction
  function setPersonImage(scrollAmount) {
      if (scrollAmount > 0) { // Scrolling right
          personImage.src = movingRightGif;
      } else if (scrollAmount < 0) { // Scrolling left
          personImage.src = movingLeftGif;
      }
  }

  // Function to stop movement and reset image to a standing position
  function stopPersonMovement() {
      const maxScrollLeft = projectList.scrollWidth - projectList.clientWidth;
      if (projectList.scrollLeft <= 0) {
          personImage.src = standingStart; // Reset to S1 at the leftmost edge
      } else if (projectList.scrollLeft >= maxScrollLeft) {
          personImage.src = standingEnd; // Set to S3 at the rightmost edge
      }
  }

  // Event listener for scroll
  projectList.addEventListener('wheel', (event) => {
      if (isFilterActive || isSearchActive) return; // Ignore scroll when filter or search is active

      const scrollAmount = event.deltaY;
      const maxScrollLeft = projectList.scrollWidth - projectList.clientWidth;
      const scrollPercentage = projectList.scrollLeft / maxScrollLeft;

      // Calculate adjusted left position for personImage based on scroll percentage
      const minLeft = 10; // Start position (10vw)
      const maxLeft = 80; // End position (80vw)
      const adjustedLeft = minLeft + (maxLeft - minLeft) * scrollPercentage;
      personImage.style.left = `calc(${adjustedLeft}vw)`;

      // Start the appropriate GIF based on scroll direction
      if ((scrollAmount > 0 && projectList.scrollLeft < maxScrollLeft) ||
          (scrollAmount < 0 && projectList.scrollLeft > 0)) {
          setPersonImage(scrollAmount);
      }

      // Stop movement and reset at boundaries
      if (projectList.scrollLeft === 0 || projectList.scrollLeft === maxScrollLeft) {
          stopPersonMovement();
      }
  });

  // Event listener for scroll stop
  projectList.addEventListener('scroll', () => {
      const maxScrollLeft = projectList.scrollWidth - projectList.clientWidth;
      if (projectList.scrollLeft <= 0 || projectList.scrollLeft >= maxScrollLeft) {
          stopPersonMovement();
      }
  });

  // Function to activate centered person image (S2.png)
  function activateCenteredPersonImage() {
      isFilterActive = true;
      isSearchActive = true;
      personImage.src = centeredImage;
      personImage.classList.add('centered-person');
      personImage.style.opacity = 1;
  }

  // Function to deactivate centered image and restore movement
  function deactivateCenteredPersonImage() {
      isFilterActive = false;
      isSearchActive = false;
      personImage.classList.remove('centered-person');
      stopPersonMovement();
  }

  // Search input event handler
  searchInput.addEventListener('input', (event) => {
      if (event.target.value.length > 0) {
          activateCenteredPersonImage();
      } else {
          deactivateCenteredPersonImage();
      }
  });

  // Filter click event listeners
  document.querySelectorAll('.category-filter li').forEach(filter => {
      filter.addEventListener('click', () => {
          const activeFilters = Array.from(document.querySelectorAll('.category-filter li.active'));
          if (activeFilters.length > 0) {
              activateCenteredPersonImage();
          } else {
              deactivateCenteredPersonImage();
          }
      });
  });
/////////////////////////////////////////

  // 定义跳转函数
  function redirectToSplash() {
    window.location.href = 'index.html';
    showLoadingOverlay();
  }
  
  // 绑定事件监听器
  const closeButton = document.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', redirectToSplash);
  }
  
  
  const youtubeVideos = {

  };
  
 // Load CSV data using PapaParse
 async function loadCSVData(csvFilePath) {
    try {
      const response = await fetch(csvFilePath);
      const csvData = await response.text();
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      });
      return parsedData.data;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      return [];
    }
  }
  
  async function loadProjectsData() {
    const projects = await loadCSVData('public/ProjectInfo.csv');
    console.log('Loaded CSV Projects:', projects);

    // Sort projects by time in descending order
    return projects.map((project, index) => ({
        number: project.Number || index + 1,
        name: project.Name || '',
        building: project.Building || '',
        area: project.Area || '',
        address: project.Address || '',
        time: project.Time || '',
        scale: project.Scale ? project.Scale.split(';').map(tag => tag.trim()) : [], // Safeguard in case Scale is missing
        type: project.Type ? project.Type.split(';').map(tag => tag.trim()) : [],    // Safeguard for Type
        status: project.Status ? project.Status.split(';').map(tag => tag.trim()) : [], // Safeguard for Status
        descriptionPath: project['DescriptionPath'] || '',
        imageFolderPath: `public/Project/${project.Number || index + 1}`,
        relatedID: project.relatedID || '',
        URL: project.URL || '',
        LEED: project.LEED || '',
        ShortS: project.ShortS || '',
    })).sort((a, b) => a.number - b.number);
  }
  
  // Create category list for filtering
  function createCategoryList(container, categories, onSelect, selectedCategory, disabledCategories = []) {
    container.innerHTML = '';
    categories.forEach(category => {
      const li = document.createElement('li');
      li.textContent = category;
      if (selectedCategory === category) li.classList.add('active');
      if (disabledCategories.includes(category)) {
        li.classList.add('disabled');
      } else {
        li.addEventListener('click', () => {
          const selected = document.querySelector(`#${container.id} li.active`);
          if (selected && selected !== li) selected.classList.remove('active');
          if (li.classList.contains('active')) {
            li.classList.remove('active');
            onSelect(category, false); // Remove filter
          } else {
            li.classList.add('active');
            onSelect(category, true); // Add filter
          }
        });
      }
      container.appendChild(li);
    });
  }
  
    // Count tags and filter those with a frequency >= 1, sorted by frequency
    function getFilteredTags(projects, tagField) {
        const tagCount = {};
        projects.forEach(project => {
            if (Array.isArray(project[tagField])) {  // Ensure the tag field exists and is an array before accessing it
                project[tagField].forEach(tag => {
                    if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });
        return Object.keys(tagCount)
            .filter(tag => tagCount[tag] >= 1)
            .sort((a, b) => tagCount[b] - tagCount[a]);
    }

  
  // Filter projects based on multiple selected filters
  function filterProjects(projects, filters) {
    return projects.filter(project => {
      return Object.keys(filters).every(key =>
        filters[key].length === 0 || filters[key].some(filter => project[key].includes(filter))
      );
    });
  }
    
  // Get relevant categories to disable others
  function getRelevantCategories(projects, filters) {
      const relevant = { scale: new Set(), status: new Set(), projectType: new Set() };
      const filteredProjects = filterProjects(projects, filters);
      
      filteredProjects.forEach(project => {
          // Check if scale exists and is an array before iterating
          if (Array.isArray(project.scale)) {
              project.scale.forEach(tag => relevant.scale.add(tag));
          }
          
          // Check if status exists and is an array before iterating
          if (Array.isArray(project.status)) {
              project.status.forEach(tag => relevant.status.add(tag));
          }
          
          // Check if projectType exists and is an array before iterating
          if (Array.isArray(project.type)) {
              project.type.forEach(tag => relevant.projectType.add(tag));
          }
      });
      
      return relevant;
  }

    
  async function getImageSectionPath(projectNumber) {
    try {
      const response = await fetch(`public/Project/${projectNumber}/file-list.json`);
      if (!response.ok) {
        throw new Error(`Failed to load file list for project ${projectNumber}`);
      }
  
      const fileList = await response.json();
  
      // 查找特定命名的 Section 文件
      const sectionFile = fileList.find(file =>
        file.startsWith(`Section${projectNumber}.`) && file.match(/\.(jpg|png|jpeg|gif)$/i)
      );
  
      if (sectionFile) {
        return `public/Project/${projectNumber}/${sectionFile}`;
      }
  
      // 如果没有找到 Section 文件，返回默认占位图像
      return 'public/Building/default-placeholder.png';
    } catch (error) {
      console.error(`Error fetching section image for project ${projectNumber}:`, error);
      return 'public/Building/default-placeholder.png';
    }
  }
  

  async function getImagePath(imageFolderPath) {
    try {
      const response = await fetch(`${imageFolderPath}/file-list.json`);
      if (!response.ok) {
        throw new Error(`Failed to load file list from ${imageFolderPath}`);
      }
  
      const fileList = await response.json();
  
      // 优先查找 Main 文件
      const mainFile = fileList.find(file =>
        file.startsWith('Main.') && file.match(/\.(png|jpg|jpeg|gif)$/i)
      );
  
      if (mainFile) {
        return `${imageFolderPath}/${mainFile}`;
      }
  
      // 如果没有 Main 文件，返回空字符串
      return '';
    } catch (error) {
      console.error('Error fetching main image:', error);
      return '';
    }
  }
  
  async function getProjectMedia(folderPath) {
    try {
      const response = await fetch(`${folderPath}/file-list.json`);
      if (!response.ok) {
        throw new Error(`Failed to load file list from ${folderPath}`);
      }
  
      const fileList = await response.json();
      const extensions = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm'];
  
      // 过滤符合条件的文件：以数字开头且文件扩展名符合要求
      const mediaFiles = fileList.filter(file => {
        const ext = file.split('.').pop().toLowerCase();
        const isNumbered = /^[0-9]/.test(file); // 以数字开头
        return extensions.includes(ext) && isNumbered;
      });
  
      // 按文件名中的数字顺序排序
      mediaFiles.sort((a, b) => {
        const numA = parseInt(a.match(/^\d+/)?.[0], 10) || 0; // 提取 a 开头的数字
        const numB = parseInt(b.match(/^\d+/)?.[0], 10) || 0; // 提取 b 开头的数字
        return numA - numB;
      });
  
      // 生成 HTML
      return mediaFiles.map(file =>
        file.endsWith('.mp4') || file.endsWith('.webm')
          ? `<video controls><source src="${folderPath}/${file}" type="video/mp4"></video>`
          : `<img src="${folderPath}/${file}" alt="Project Media" />`
      ).join('');
    } catch (error) {
      console.error('Error fetching project media:', error);
      return '';
    }
  }
  
  
  // Display the filtered projects
  async function displayProjects(projects) {
      const projectList = document.getElementById('project-list');
      projectList.innerHTML = '';  // Clear the list before rendering

      const cardWidth = 300;  // Set to match the CSS class `.project-card` width
      const minVisibleCards = 5;
      const totalVisibleWidth = cardWidth * minVisibleCards;

      for (const project of projects) {
          const card = document.createElement('div');
          card.className = 'project-card';
          card.dataset.projectNumber = project.number;

          // Fetch the image based on the project number
          const imagePath = await getImageSectionPath(project.number); // Use project.number here

          // Updated to display Time, Name, Building, and Address
          card.innerHTML = `
              <div class="project-info">
                  <h4>${project.name}</h4>
                  <h5>${project.building}</h5>
                  <h5>${project.ShortS}</h5>
                  <h5>${project.LEED}</h5>
              </div>
              <img src="${imagePath}" alt="${project.name}" />
          `;

          card.addEventListener('click', e => {
              e.stopPropagation();
              animateToDetails(project, card);
          });

          projectList.appendChild(card);
      }

      // Initialize smooth scrolling behavior
      let isScrolling = false;
      projectList.scrollLeft = 0;

      // Wheel event with debouncing
      let wheelTimeout;
      projectList.addEventListener('wheel', e => {
          e.preventDefault();
          if (!isScrolling) {
              isScrolling = true;
              const scrollAmount = cardWidth * (e.deltaY > 0 ? 1 : -1);

              projectList.scrollBy({
                  left: scrollAmount,
                  behavior: 'smooth',
              });

              clearTimeout(wheelTimeout);
              wheelTimeout = setTimeout(() => {
                  isScrolling = false;
              }, 200);
          }
      });
  }

  

  function convertTextToHTML(text) {
    // 正则表达式匹配 URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return `<a href="${url}" target="_blank">${url}</a>`; // 将URL转换为点击链接
    }).replace(/\n/g, '<br>'); // 替换换行符为HTML换行
  }
  
  // Base path for GitHub Pages deployment
  const basePath = '/Payette-AIA-Tour-App';

  async function loadDescription(descriptionPath) {
    try {
      // 确保 descriptionPath 包含基础路径
      const fullPath = `${basePath}/${descriptionPath}`;
      const response = await fetch(fullPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch description from ${fullPath}`);
      }

      let text = await response.text();
      // 转换文本中的链接到 HTML 超链接
      text = convertTextToHTML(text);
      return text;
    } catch (error) {
      console.error("Failed to load description from", descriptionPath, error);
      return "Description not available.";
    }
  }


/////////////////
  // Example function to add navigation bar based on related ID
  function addRelatedNavigation(currentID, relatedID, isTool) {
    const navBar = document.createElement('div');
    navBar.classList.add('related-nav-bar');

    // 创建项目详情标签
    const projectTab = document.createElement('span');
    projectTab.textContent = '项目详情';
    projectTab.classList.add(isTool ? 'inactive' : 'active');
    projectTab.onclick = () => {
        window.location.href = `project_index.html?id=${currentID}&related=${relatedID}`;
    };

    // 创建工具开发标签
    const toolTab = document.createElement('span');
    toolTab.textContent = '工具开发';
    toolTab.classList.add(isTool ? 'active' : 'inactive');
    toolTab.onclick = () => {
        window.location.href = `computational_index.html?id=${relatedID}&related=${currentID}`;
    };

    navBar.appendChild(projectTab);
    navBar.appendChild(toolTab);
    document.getElementById('details-container').prepend(navBar);
  }

  // Check page type on load
  const urlParams = new URLSearchParams(window.location.search);
  const currentID = urlParams.get('id');  // 获取当前页面 ID 参数
  const relatedID = urlParams.get('related'); // 获取关联页面 ID 参数

  // 默认设置为项目详情页
  const isTool = currentID && window.location.pathname.includes('project_index.html');

  // 如果存在关联 ID，则在详情页上添加导航栏
  if (relatedID && currentID) {
    addRelatedNavigation(currentID, relatedID, isTool);
  }


/////////////////
  
  async function displayProjectDetails(project, skipAnimation = false) {


    const mainContainer = document.getElementById('main-container');
    const detailsContainer = document.getElementById('details-container');
    const header = document.querySelector('header');

    const description = await loadDescription(project.descriptionPath);
    const mainImageSrc = await getImagePath(project.imageFolderPath);
    const projectMedia = await getProjectMedia(project.imageFolderPath);

    const closeButtonHTML = `
      <button class="close-button" style="position: fixed; right: 20px; top: 15px; z-index: 1001;" onclick="redirectToSplash()">✖</button>
    `;

    let urlLink = '';
    if (project.URL) {
        urlLink = `<a href="${project.URL}" target="_blank" class="tool-url-link" style="text-decoration: underline; font-size: 14px;font-style: normal; color:  #333129; display: block; margin-bottom: 10px;">${project.URL}</a>`;
    }

    const tags = [ (project.ShortS || [])];

    let youtubeEmbed = '';
    if (youtubeVideos[project.number]) {
        youtubeEmbed = youtubeVideos[project.number].map(videoId => {
            const startTime = (project.number === "19" && videoId === "r2j1Fd_j618") ? "?start=2" : "";
            return `<div class="aspect-ratio">
                <iframe src="https://www.youtube.com/embed/${videoId}${startTime}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
        }).join('');

    }

    // URL 参数解析
    const urlParams = new URLSearchParams(window.location.search);
    const relatedID = urlParams.get('related');
    const currentID = project.number;
    const isTool = window.location.pathname.includes('project_index.html');

    // 创建导航栏
    const navBarHTML = `
      <div class="fixed-header">
        <div class="back-button" onclick="window.location.href='project_index.html'">< Dashboard</div>
        
        <div class="center-nav-bar">
            <span class="custom-nav-item ${isTool ? 'active' : 'inactive'}" 
                  onclick="window.location.href='project_index.html?id=${currentID}${relatedID ? `&related=${relatedID}` : ''}'">
                Project Info
            </span>
            ${relatedID ? `
            <span class="custom-nav-item ${!isTool ? 'active' : 'inactive'}" 
                  onclick="window.location.href='computational_index.html?id=${relatedID}&related=${currentID}'">
                Computational Tool
            </span>
            ` : ''}
        </div>
        
        <button class="close-button" onclick="redirectToSplash()">✖</button>
      </div>
    `;

    // 导航栏插入到详情页面顶部
    detailsContainer.innerHTML = navBarHTML + `
      <div class="details-header" style="background-image: url('${mainImageSrc}');">
        <h2>${project.name}</h2>
      </div>
      <div class="details-content">
        <div class="details-sidebar">
          <h3>${project.name}</h3>
          ${urlLink} <!-- 在此处插入 URL 链接 -->
          <div class="tags">${tags.map(tag => `<div class="tag">${tag}</div>`).join('')}</div>
          <p>${description.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="details-gallery">
          ${youtubeEmbed}
          ${projectMedia}
        </div>
      </div>
    `;

    if (skipAnimation) {
      detailsContainer.style.display = 'block';
      mainContainer.style.display = 'none';
      header.style.display = 'none';
    } else {
      document.querySelector('.back-button').addEventListener('click', () => {
        // Reset the URL and return to the project index page
        window.location.href = 'project_index.html';
      });
    }
  }

  async function animateToDetails(project, card) {
    const mainContainer = document.getElementById('main-container');
    const detailsContainer = document.getElementById('details-container');
    const header = document.querySelector('header');
    const thumbnailImg = card.querySelector('img');
    const rect = thumbnailImg.getBoundingClientRect();

    header.style.display = 'none';
    mainContainer.style.display = 'none';

    const mainImageSrc = await getImagePath(project.imageFolderPath); // 确保路径存在
    const expandedImage = document.createElement('img');
    expandedImage.src = mainImageSrc;
    expandedImage.className = 'transition-image';
    expandedImage.style.position = 'fixed';
    expandedImage.style.top = `${rect.top}px`;
    expandedImage.style.left = `${rect.left}px`;
    expandedImage.style.width = `${rect.width}px`;
    expandedImage.style.height = `${rect.height}px`;
    expandedImage.style.objectFit = 'cover';
    expandedImage.style.zIndex = '10000';
    expandedImage.style.transition = 'all 0.8s ease';

    document.body.appendChild(expandedImage);

    // 延迟执行扩展动画
    setTimeout(() => {
        expandedImage.style.top = '0';
        expandedImage.style.left = '0';
        expandedImage.style.width = '100vw';
        expandedImage.style.height = '100vh';
    }, 50); // 微小延迟

    // transitionend 事件监听器，确保动画结束后执行后续操作
    expandedImage.addEventListener('transitionend', async () => {
        const currentID = project.number; 
        const relatedID = project.relatedID;  // 从项目数据中获取相关 ID

        // 根据是否存在 relatedID 构造 URL
        const baseURL = window.location.pathname.includes('project_index.html') ? 'project_index.html' : 'computational_index.html';
        const url = relatedID ? `${baseURL}?id=${currentID}&related=${relatedID}` : `${baseURL}?id=${currentID}`;

        // 显示详情页并更新 URL
        await displayProjectDetails(project);
        history.pushState({ projectId: project.number }, `Project ${project.number}`, url);
        detailsContainer.style.display = 'block';
        detailsContainer.scrollTo(0, 0);
        expandedImage.remove(); // 移除 expandedImage 元素
    });
  }

  
  async function main() {
    
    const projects = await loadProjectsData();
    const filters = { scale: [], type: [], status: [] };

    // Ensure the scale, type, and status lists exist before processing
    const scaleCategories = getFilteredTags(projects, 'scale');
    const typeCategories = getFilteredTags(projects, 'type');
    const statusCategories = getFilteredTags(projects, 'status');  // Make sure status is defined and checked

    function updateProjects() {
        const filteredProjects = filterProjects(projects, filters);
        displayProjects(filteredProjects);
        hideLoadingOverlay()
        const relevant = getRelevantCategories(projects, filters);
        
        createCategoryList(document.getElementById('scale-list'), scaleCategories, (scale, add) => {
            filters.scale = add ? [scale] : [];
            updateProjects();
        }, filters.scale[0], scaleCategories.filter(cat => !relevant.scale.has(cat)));

        createCategoryList(document.getElementById('status-list'), statusCategories, (status, add) => {
            filters.status = add ? [status] : [];
            updateProjects();
        }, filters.status[0], statusCategories.filter(cat => !relevant.status.has(cat)));

        createCategoryList(document.getElementById('type-list'), typeCategories, (type, add) => {
            filters.type = add ? [type] : [];
            updateProjects();
        }, filters.type[0], typeCategories.filter(cat => !relevant.projectType.has(cat)));
    }

  
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
  
    if (projectId) {
      const project = projects.find(p => p.number.toString() === projectId);
      if (project) {
        await displayProjectDetails(project, true); // 直接展示详情页
        hideLoadingOverlay()
      } else {
        console.warn('Project not found for ID:', projectId); // 如果项目未找到，添加警告日志
      }
    } else {
      updateProjects();
    }
  
    document.getElementById('search-input').addEventListener('input', event => {
      const query = event.target.value.toLowerCase();
      const filteredProjects = projects.filter(project =>
        Object.values(project).some(value => value && value.toString().toLowerCase().includes(query))
      );
      displayProjects(filteredProjects);
    });
  
    window.addEventListener('popstate', function(event) {
      if (event.state && event.state.projectId) {
        const project = projects.find(p => p.number.toString() === event.state.projectId);
        if (project) {
          displayProjectDetails(project, false); // 正常情况下展示详情页
        }
      } else {
        updateProjects();
        history.replaceState(null, null, 'index.html');
      }
    });
  }
  
  main();
  