document.addEventListener('DOMContentLoaded', function() {
    
  const filterOverlay = document.getElementById("filter-overlay");
  const groupList = document.getElementById("group-list");
  const softwareList = document.getElementById("software-list");
  const typeList = document.getElementById("type-list");

  const filters = {
    group: new Set(),
    software: new Set(),
    type: new Set(),
  };

  // 初始化过滤器列表项点击事件
  function initializeFilters(container, filterSet) {
    if (!container) {
      console.error("Container element not found for:", filterSet);
      return;
    }

    container.addEventListener("click", (e) => {
      const target = e.target;
      if (target.tagName === "LI") {
        if (filterSet.has(target.textContent)) {
          filterSet.delete(target.textContent);
          target.classList.remove("active");
        } else {
          filterSet.add(target.textContent);
          target.classList.add("active");
        }
      }
    });
  }

  initializeFilters(groupList, filters.group);
  initializeFilters(softwareList, filters.software);
  initializeFilters(typeList, filters.type);

  // 显示过滤窗口
  document.getElementById("menu-toggle").addEventListener("click", () => {
    filterOverlay.classList.toggle("hidden");
  });

  // 关闭过滤窗口时保持激活状态
  filterOverlay.addEventListener("click", (e) => {
    if (e.target === filterOverlay) {
      filterOverlay.classList.add("hidden");
    }
  });

  // 示例数据
  const exampleData = {
    group: ["Group A", "Group B", "Group C"],
    software: ["Revit", "Rhino", "Grasshopper"],
    type: ["Visualization", "Simulation", "Design"],
  };

  function createFilterItems(container, items) {
    if (!container) {
      console.error("Container element not found for filter items.");
      return;
    }

    container.innerHTML = ""; // 清空之前的项
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      if (filters[container.id.replace("-list", "")].has(item)) {
        li.classList.add("active"); // 保持激活状态
      }
      container.appendChild(li);
    });
  }

  createFilterItems(groupList, exampleData.group);
  createFilterItems(softwareList, exampleData.software);
  createFilterItems(typeList, exampleData.type);

  // Dashboard按钮跳转逻辑
  const projectDashboardBtn = document.getElementById("project-dashboard-btn");
  const computationalDashboardBtn = document.getElementById(
    "computational-dashboard-btn"
  );

  if (projectDashboardBtn) {
    projectDashboardBtn.addEventListener("click", () => {
      const mode = localStorage.getItem("viewMode") || "desktop";
      const url =
        mode === "mobile" ? "project_index_mobile.html" : "project_index.html";
      window.location.href = url;
    });
  }

  if (computationalDashboardBtn) {
    computationalDashboardBtn.addEventListener("click", () => {
      const mode = localStorage.getItem("viewMode") || "desktop";
      const url =
        mode === "mobile"
          ? "computational_index_mobile.html"
          : "computational_index.html";
      window.location.href = url;
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
    "3": ["uunEUolDUPo"],
    "8": ["Aj9oEWoZAuo"],
    "9": ["fhGVFytW3e8"],
    "13": ["QMSgBtqNvFg"],
    "14": ["mibcLvENdgc"],
    "15": ["NwC19wjKIps"],
    "19": ["r2j1Fd_j618", "hjeMOjrBWtI"], 
    "20": ["L68YlQrq2kM"],
    "23": ["cVOgolVOhpM"],
    "24": ["VHiQOqyjtVg"]
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
  
  // Load project data and associate each project with its folder path
  async function loadProjectsData() {
    const projects = await loadCSVData('public/ToolInfo.csv');
    console.log('Loaded CSV Projects:', projects);
    return projects.map((project, index) => ({
      number: project.Number || index + 1,
      group: project.Group || '',
      software: project.Software ? project.Software.split(';').map(tag => tag.trim()) : [],
      app: project.App ? project.App.split(';').map(tag => tag.trim()) : [],
      weight: parseInt(project.Weight, 10) || 0,
      projectName: project['Project Name'] ? project['Project Name'].split(';').map(tag => tag.trim()) : [],
      projectType: project['Project Type'] ? project['Project Type'].split(';').map(tag => tag.trim()) : [],
      descriptionPath: project.DescriptionPath || '',
      imageFolderPath: `public/Tool/${project.Number || index + 1}`,
      relatedID: project.relatedID || '', 
      url: project.URL || '', 
    })).sort((a, b) => b.weight - a.weight);
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
  
  // Count tags and filter those with a frequency >= 3, sorted by frequency
  function getFilteredTags(projects, tagField) {
    const tagCount = {};
    projects.forEach(project => {
      project[tagField].forEach(tag => {
        if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
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
    const relevant = { group: new Set(), software: new Set(), projectType: new Set() };
    const filteredProjects = filterProjects(projects, filters);
    filteredProjects.forEach(project => {
      if (project.group) relevant.group.add(project.group);
      project.software.forEach(tag => relevant.software.add(tag));
      project.projectType.forEach(tag => relevant.projectType.add(tag));
    });
    return relevant;
  }
  
  async function getProjectMedia(folderPath) {
    try {
      const response = await fetch(`${folderPath}/file-list.json`);
      if (!response.ok) {
        throw new Error(`Failed to load file list from ${folderPath}`);
      }
  
      const fileList = await response.json();
      const extensions = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm'];
  
      // 过滤符合条件的文件：以数字开头且不包含 'Main'
      const mediaFiles = fileList.filter(file => {
        const ext = file.split('.').pop().toLowerCase();
        const isNumbered = /^[0-9]/.test(file); // 以数字开头
        const isNotMain = !file.startsWith('Main');
        return extensions.includes(ext) && isNumbered && isNotMain;
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
      console.error('Error fetching file list:', error);
      return ''; // 遇到错误时返回空字符串
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
      const mainFile = fileList.find(file => file.startsWith('Main.') && file.match(/\.(png|jpg|jpeg|gif)$/i));
      if (mainFile) {
        return `${imageFolderPath}/${mainFile}`;
      }
  
      // 如果没有 Main 文件，返回第一个图片文件
      const firstImage = fileList.find(file => file.match(/\.(png|jpg|jpeg|gif)$/i));
      return firstImage ? `${imageFolderPath}/${firstImage}` : '';
    } catch (error) {
      console.error('Error fetching main image:', error);
      return ''; // 返回空字符串以避免中断逻辑
    }
  }
  
  
  async function displayProjects(projects) {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';  // 每次渲染前清空列表
  
    const cardWidth = 300;  // Set to match the CSS class `.project-card` width
    const minVisibleCards = 5;
    const totalVisibleWidth = cardWidth * minVisibleCards;
  
    for (const project of projects) {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.dataset.projectNumber = project.number;
  
      const tags = [...project.software, ...project.projectName, ...project.projectType].filter(Boolean);
      const imagePath = await getImagePath(project.imageFolderPath);
      card.innerHTML = `
        <div class="project-info">
          <h4>${project.app[0]}</h4>
          <div class="tags">
            ${tags.map(tag => `<div class="tag">${tag}</div>`).join('')}
          </div>
        </div>
        <img src="${imagePath}" alt="${project.app[0]}" />
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
  
  
  async function loadDescription(descriptionPath) {
    try {
      const response = await fetch(descriptionPath);
      let text = await response.text();
      // 转换文本中的链接到HTML超链接
      text = convertTextToHTML(text);
      return text;
    } catch (error) {
      console.error("Failed to load description from", descriptionPath, error);
      return "Description not available.";
    }
  }


///////////////
  // Example function to add navigation bar based on related ID
  function addRelatedNavigation(currentID, relatedID, isTool) {
    const navBar = document.createElement('div');
    navBar.classList.add('related-nav-bar');

    // 创建工具开发标签
    const toolTab = document.createElement('span');
    toolTab.textContent = '工具开发';
    toolTab.classList.add(isTool ? 'active' : 'inactive');
    toolTab.onclick = () => {
        window.location.href = `computational_index.html?id=${currentID}&related=${relatedID}`;
    };

    // 创建项目详情标签
    const projectTab = document.createElement('span');
    projectTab.textContent = '项目详情';
    projectTab.classList.add(isTool ? 'inactive' : 'active');
    projectTab.onclick = () => {
        window.location.href = `project_index.html?id=${relatedID}&related=${currentID}`;
    };

    navBar.appendChild(toolTab);
    navBar.appendChild(projectTab);
    document.getElementById('details-container').prepend(navBar);
  }

  // Check page type on load
  const urlParams = new URLSearchParams(window.location.search);
  const currentID = urlParams.get('id');  // 获取当前页面 ID 参数
  const relatedID = urlParams.get('related'); // 获取关联页面 ID 参数

  // 判断当前页面是工具详情页还是项目详情页
  const isTool = currentID && window.location.pathname.includes('computational_index_mobile.html');

  // 如果存在关联 ID，则在详情页上添加导航栏
  if (relatedID && currentID) {
    addRelatedNavigation(currentID, relatedID, isTool);
  }

//////////////
  async function displayProjectDetails(project, skipAnimation = false) {
    const mainContainer = document.getElementById('main-container');
    const detailsContainer = document.getElementById('details-container');
    const header = document.querySelector('header');

    const description = await loadDescription(project.descriptionPath);
    const mainImageSrc = await getImagePath(project.imageFolderPath);

    const closeButtonHTML = `
      <button class="close-button" style="position: fixed; right: 20px; top: 15px; z-index: 1001;" onclick="redirectToSplash()">✖</button>
    `;

    const tags = [...(project.software || []), ...(project.app || []), ...(project.projectType || []), ...(project.projectName || [])];

    let urlLink = '';
    if (project.url) {
        urlLink = `<a href="${project.url}" target="_blank" class="tool-url-link" style="text-decoration: underline; font-size: 14px;font-style: normal; color:  #333129; display: block; margin-bottom: 10px;">${project.url}</a>`;
    }

    let youtubeEmbed = '';
    if (youtubeVideos[project.number]) {
      youtubeEmbed = youtubeVideos[project.number].map(videoId => {
        const startTime = (project.number === "19" && videoId === "r2j1Fd_j618") ? "?start=2" : "";
        return `<div class="aspect-ratio">
            <iframe src="https://www.youtube.com/embed/${videoId}${startTime}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>`;
      }).join('');
    }

    const projectMedia = await getProjectMedia(project.imageFolderPath);


    // URL 参数解析
    const urlParams = new URLSearchParams(window.location.search);
    const relatedID = urlParams.get('related');
    const currentID = project.number;
    const isTool = window.location.pathname.includes('computational_index_mobile.html');
    console.log("Current ID:", currentID, "Related ID:", relatedID);


    // 创建导航栏
    const navBarHTML = `
      <div class="fixed-header">
        <div class="back-button" onclick="window.location.href='computational_index_mobile.html'">< Dashboard</div>
        
        <div class="center-nav-bar">
            <span class="custom-nav-item ${isTool ? 'active' : 'inactive'}" 
                  onclick="window.location.href='computational_index_mobile.html?id=${currentID}${relatedID ? `&related=${relatedID}` : ''}'">
                Computational Tool
            </span>
            ${relatedID ? `
            <span class="custom-nav-item ${!isTool ? 'active' : 'inactive'}" 
                  onclick="window.location.href='project_index.html?id=${relatedID}&related=${currentID}'">
                Project Info
            </span>
            ` : ''}
        </div>
        
        <button class="close-button" onclick="redirectToSplash()">✖</button>
      </div>
    `;
  
    // 导航栏插入到详情页面顶部
    detailsContainer.innerHTML = navBarHTML + `
        <div class="details-header" style="background-image: url('${mainImageSrc}');">
            <h2>${project.app[0]}</h2>
        </div>
        <div class="details-content">
            <div class="details-sidebar">
                <h3>${project.app[0]}</h3>
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
        // Reset the URL and return to the computational index page
        window.location.href = 'computational_index_mobile.html'; // Use href for immediate URL change and navigation
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

    // 添加 transitionend 事件监听器
    expandedImage.addEventListener('transitionend', async () => {
        const currentID = project.number; 
        const relatedID = project.relatedID;  // 从项目数据中获取相关 ID

        // 检查是否有 relatedID 并生成 URL
        const baseURL = window.location.pathname.includes('computational_index_mobile.html') ? 'computational_index_mobile.html' : 'project_index.html';
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
    const filters = { group: [], software: [], projectType: [] };
  
    const groupCategories = ['Computational Design', 'Design Visualization', 'Building Science', 'Space Strategy', 'Project Management'];
    const softwareCategories = getFilteredTags(projects, 'software');
    const typeCategories = getFilteredTags(projects, 'projectType');
  
    function updateProjects() {
      const filteredProjects = filterProjects(projects, filters);
      displayProjects(filteredProjects);
      hideLoadingOverlay()
      const relevant = getRelevantCategories(projects, filters);
      createCategoryList(document.getElementById('group-list'), groupCategories, (group, add) => {
        filters.group = add ? [group] : [];
        updateProjects();
      }, filters.group[0], groupCategories.filter(cat => !relevant.group.has(cat)));
  
      createCategoryList(document.getElementById('software-list'), softwareCategories, (software, add) => {
        filters.software = add ? [software] : [];
        updateProjects();
      }, filters.software[0], softwareCategories.filter(cat => !relevant.software.has(cat)));
  
      createCategoryList(document.getElementById('type-list'), typeCategories, (type, add) => {
        filters.projectType = add ? [type] : [];
        updateProjects();
      }, filters.projectType[0], typeCategories.filter(cat => !relevant.projectType.has(cat)));
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
  