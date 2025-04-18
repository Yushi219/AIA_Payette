function navigateTo(viewType) {
  if (viewType === 'map') {
    window.location.href = 'index.html';
  } else {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('view', viewType);
    window.location.href = newUrl.toString();
  }
}

document.addEventListener('DOMContentLoaded', function() { 


  const menuToggleButton = document.getElementById('menu-toggle');
  const typeList = document.getElementById("type-list");
  const leedList = document.getElementById("leed-list");
  const statusList = document.getElementById("status-list");



  // 设置人物初始位置为起始点
    const minLeft = 10; // 起始位置为 20vw
    personImage.style.left = `calc(${minLeft}vw)`;  // 初始位置为 20vw
    //personImage.src = imageStill[0]; // 设置为 S1 图片
  
    // 从 URL 获取 dashboard 参数
    const urlParams = new URLSearchParams(window.location.search);
    let currentDashboard = urlParams.get('dashboard') || 'project'; // Default to Project Dashboard
  

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
  let lastScrollLeft = 0; // 上一次的滚动位置

  // Define images and GIFs
  const standingStart = 'public/S1.png';
  const standingEnd = 'public/S3.png';
  const movingRightGif = 'public/R.gif';
  const movingLeftGif = 'public/L.gif';

  // Function to set the person image based on scroll direction
  function setPersonImage(direction) {
    if (direction > 0) {
      personImage.src = movingRightGif; // Moving right
    } else if (direction < 0) {
      personImage.src = movingLeftGif; // Moving left
    }
  }

  // Function to stop movement and reset image to a standing position
  function stopPersonMovement() {
    const maxScrollLeft = projectList.scrollWidth - projectList.clientWidth;
    if (projectList.scrollLeft <= 0) {
      personImage.src = standingStart; // Reset to S1 at the leftmost edge
    } else if (projectList.scrollLeft >= maxScrollLeft) {
      personImage.src = standingEnd; // Set to S3 at the rightmost edge
    } else {
      personImage.src = standingStart; // Standing in between
    }
  }

  // Adjust person's position based on scroll percentage
  function updatePersonPosition() {
    const maxScrollLeft = projectList.scrollWidth - projectList.clientWidth;
    const scrollPercentage = projectList.scrollLeft / maxScrollLeft;

    const minLeft = 10; // Start position (10vw)
    const maxLeft = 80; // End position (80vw)
    const adjustedLeft = minLeft + (maxLeft - minLeft) * scrollPercentage;

    personImage.style.left = `calc(${adjustedLeft}vw)`;
  }

  // Event listener for scroll
  projectList.addEventListener('scroll', () => {

    const maxScrollLeft = projectList.scrollWidth - projectList.clientWidth;
    const direction = projectList.scrollLeft - lastScrollLeft; // 滚动方向

    // Check if the current scroll position extends beyond visible bounds
    if (projectList.scrollLeft > 0 && projectList.scrollLeft < maxScrollLeft) {
      setPersonImage(direction); // Set the correct GIF based on direction
      updatePersonPosition(); // Update position relative to list
    }

    // Stop movement if at the edges
    if (projectList.scrollLeft <= 0 || projectList.scrollLeft >= maxScrollLeft) {
      stopPersonMovement();
    }

    lastScrollLeft = projectList.scrollLeft; // Update last scroll position
  });

  // Stop movement on touchend (for touch devices)
  projectList.addEventListener('touchend', () => {
    stopPersonMovement();
  });


  ////////////////////////////////////////



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
  
  
  function goBackSmart() {
    const previousPage = localStorage.getItem('previousPage');
    const viewMode = localStorage.getItem('viewMode');
    localStorage.removeItem('previousPage');
  
    const isMobile = viewMode === 'mobile';
    const returnPage = isMobile ? 'project_index_mobile.html' : 'project_index.html';
  
    if (previousPage === 'dashboard') {
      window.location.href = returnPage;
    } else if (document.referrer && document.referrer !== window.location.href) {
      history.back();
    } else {
      window.location.href = 'index.html';
    }
  }
  
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
  
  async function loadProjectInfoData() {
    try {
      const response = await fetch('public/ProjectInfo.json');
      if (!response.ok) throw new Error('Failed to load project info');
      return await response.json();
    } catch (e) {
      console.error(e);
      return {};
    }
  }
  

  async function displayProjects(projects, viewType = 'info') {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';  // Clear the list before rendering

    const cardWidth = 300;  // Set to match the CSS class `.project-card` width
    const minVisibleCards = 5;
    const totalVisibleWidth = cardWidth * minVisibleCards;

    const infoData = await loadProjectInfoData();

    for (const project of projects) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectNumber = project.number;

        // Fetch the image based on the project number
        const imagePath = `public/Project/Section${project.number}.jpg`;
        const hoverImagePath = `public/Project/Section${project.number}R.jpg`;
        const info = infoData[`Project${project.number}`]?.[0];

        // 构造 info 下部内容
        let detailContent = '';
    
        if (viewType === 'info') {
          detailContent = ''; // 已经改成用图片表示，无需再生成文字内容
        } else if (viewType === 'awards') {
          const awards = info?.Awards || [];
          detailContent = awards.slice(0, 15).map(a => `
            <h5>${a.AwardsYear} - ${a.Award}</h5>
          `).join('');
        } else if (viewType === 'leed') {
          detailContent = `
            <h5>${info?.LEEDStatus || ''}</h5>
            <h5>${info?.EUI || ''}</h5>
            <h5>${info?.Percent || ''}</h5>
            <h5>${info?.Sentence || ''}</h5>
          `;
        }
        
    
        let overlayImagePath = '';
        let overlayStyle = '';
        
        if (viewType === 'awards') {
          overlayImagePath = `public/Project/MA${project.number}.png`;
          overlayStyle = 'position: absolute; top: 200px; left: 50%; transform: translate(-50%, -50%); width: 100%; height: auto;';
        } else if (viewType === 'leed') {
          overlayImagePath = `public/Project/L${project.number}.png`;
          overlayStyle = 'position: absolute; top: 200px; left: 50%; transform: translate(-50%, -50%); width: 100%; height: auto;';
        } else {
          overlayImagePath = `public/Project/MT${project.number}.png`;
          overlayStyle = ''; // 默认 Info 不需位置控制
        }
        
        
        card.innerHTML = `
        <div class="project-info">
          <div class="image-stack" data-project="${project.number}" style="position: relative;">
            <img class="info-overlay" src="${overlayImagePath}" style="${overlayStyle}" />
            <img class="text-background" src="public/Project/T${project.number}.png" />
            <img class="text-drip" src="public/Project/T${project.number}C.png" />
          </div>
        </div>
        <img class="section-image"
             src="${imagePath}" 
             alt="${project.name}" />
      `;
      
      
      card.addEventListener('mouseenter', () => {
        const stack = card.querySelector('.image-stack');
        const infoImg = stack.querySelector('.info-overlay');
        const dripImg = stack.querySelector('.text-drip');
      
        console.log('[Hover] Enter');
        infoImg.style.opacity = '0';
      
        // 从上到下 reveal：clip 从完全裁掉到底部全显示
        dripImg.style.clipPath = 'inset(0 0 0% 0)';
      });
      
      card.addEventListener('mouseleave', () => {
        const stack = card.querySelector('.image-stack');
        const infoImg = stack.querySelector('.info-overlay');
        const dripImg = stack.querySelector('.text-drip');
      
        console.log('[Hover] Leave');
        infoImg.style.opacity = '1';
      
        // 再次裁切为完全隐藏
        dripImg.style.clipPath = 'inset(0 0 100% 0)';
      });
      
      card.addEventListener('click', async e => {
        e.stopPropagation();
        localStorage.setItem('previousPage', 'dashboard'); 
        await displayProjectDetails(project, true);
        history.pushState({ projectId: project.number }, `Project ${project.number}`, `?id=${project.number}&view=${viewType}`);
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
  function addRelatedNavigation(currentID, relatedID) {
    const navBar = document.createElement('div');
    navBar.classList.add('related-nav-bar');
  
    const projectTab = document.createElement('span');
    projectTab.textContent = '项目详情';
    projectTab.classList.add('active');
    projectTab.onclick = () => {
      window.location.href = `project_index.html?id=${currentID}&related=${relatedID}`;
    };
  
    navBar.appendChild(projectTab);
    document.getElementById('details-container').prepend(navBar);
  }

  // Check page type on load
  const urlParams = new URLSearchParams(window.location.search);
  const currentID = urlParams.get('id');  // 获取当前页面 ID 参数
  const relatedID = urlParams.get('related'); // 获取关联页面 ID 参数



  // 如果存在关联 ID，则在详情页上添加导航栏
  if (relatedID && currentID) {
    addRelatedNavigation(currentID, relatedID);
  }


/////////////////////

  async function loadPhotoTour(projectNumber, photoNumber = '1') {
    currentProjectNumber = projectNumber;
    photoNumber = photoNumber.toString();
    
    currentPhotoIndex = parseInt(photoNumber);
    
    

    const tourImage = document.getElementById('tour-image');
    const dotOverlay = document.getElementById('dot-overlay');

    const csvPath = `public/Photo/${projectNumber}/PL.csv`;
    const imagePath = `public/Photo/${projectNumber}/${photoNumber}.jpg`;

    tourImage.style.opacity = 0;
    tourImage.src = imagePath;

    tourImage.onload = () => {
      tourImage.style.opacity = 1;
    
      const container = tourImage.parentElement;
      const naturalWidth = tourImage.naturalWidth;
      const naturalHeight = tourImage.naturalHeight;
      const displayHeight = tourImage.clientHeight;
      const displayWidth = tourImage.clientWidth;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;
    
      const verticalOffset = (containerHeight - displayHeight) / 2;
      const horizontalOffset = (containerWidth - displayWidth) / 2;
    
      dotOverlay.innerHTML = '';
    
      fetch(csvPath)
        .then(res => res.text())
        .then(csvText => {
          const data = Papa.parse(csvText, { header: true }).data;
          const currentDots = data.filter(row => row.PhotoNumber === photoNumber);
    
          currentDots.forEach(dot => {
            const dotEl = document.createElement('div');
            dotEl.classList.add('tour-dot');
    
            const x = parseFloat(dot.X);
            const y = parseFloat(dot.Y);
    
            dotEl.style.left = `${horizontalOffset + displayWidth * x}px`;
            dotEl.style.top = `${verticalOffset + displayHeight * y}px`;
    
            const gif = document.createElement('img');
            gif.src = 'public/hand.gif';
            gif.className = 'hand-gif';
            dotEl.appendChild(gif);
    
            dotEl.addEventListener('click', () => {
              const targetPhoto = dot.CircleNumber.trim();
              if (targetPhoto && targetPhoto !== currentPhotoIndex.toString()) {
                photoHistory.push(currentPhotoIndex);
                loadPhotoTour(projectNumber, targetPhoto);
              }
            });
    
            dotOverlay.appendChild(dotEl);
          });
    
          // 插入在这里！
          let dotsVisible = true;
          const toggleButton = document.getElementById('toggle-dots');
          toggleButton.textContent = 'Hide Guide';
    
          toggleButton.addEventListener('click', () => {
            dotsVisible = !dotsVisible;
            const allDots = document.querySelectorAll('.tour-dot');
    
            allDots.forEach(dot => {
              dot.style.display = dotsVisible ? 'block' : 'none';
            });
    
            toggleButton.textContent = dotsVisible ? 'Hide Guide' : 'Show Guide';
          });
        });
    };
    
    
  }

  let currentProjectNumber = null;
  let currentPhotoIndex = 1;
  let photoHistory = [];


  function goToPrevPhoto() {
    if (photoHistory.length > 0) {
      const lastPhoto = photoHistory.pop();
      loadPhotoTour(currentProjectNumber, lastPhoto.toString());
    }
  }


  function goToNextPhoto() {
    photoHistory.push(currentPhotoIndex);
    currentPhotoIndex++;
    loadPhotoTour(currentProjectNumber, currentPhotoIndex.toString());
  }

  function toggleContent(button) {
    const content = button.nextElementSibling;
    content.classList.toggle('collapsed');
    button.textContent = content.classList.contains('collapsed') ? '► ' + button.textContent.slice(2) : '▼ ' + button.textContent.slice(2);
  }

  function setupInfoOverlayScroll() {
    const container = document.getElementById('details-container');
    const overlay = document.getElementById('info-overlay');

    if (!container || !overlay) return;

  }

  function toggleCollapse(button) {
    const targetId = button.dataset.target;
    const content = document.getElementById(targetId);

    if (!content) {
      console.warn(`toggleCollapse error: element with id '${targetId}' not found.`);
      return;
    }

    const collapsed = content.classList.toggle('collapsed');
    button.innerHTML = collapsed ? '▲' : '▼';
  }



  // Add this new logic to your `displayProjectDetails` function, replacing the old sidebar/gallery logic

  async function displayProjectDetails(project, skipAnimation = false) {
    const mainContainer = document.getElementById('main-container');
    const detailsContainer = document.getElementById('details-container');
    const header = document.querySelector('header');

    const navBarHTML = `
      <button class="close-button1" onclick="goBackSmart()">✖</button>
    `;

    detailsContainer.innerHTML = navBarHTML  +  `
    <div class="details-container">
      <div class="photo-wrapper">
        <div class="image-container">
          <img id="tour-image" />
          <div id="dot-overlay"></div>        
          <div class="photo-nav left-nav">❮</div>
          <div class="photo-nav center-nav" id="toggle-dots">Show Guide</div>
          <div class="photo-nav right-nav">❯</div>
        </div>        
      </div>
      <div id="info-overlay">
        <div class="info-header">
          <div class="info-left">
            <h2 id="info-name"></h2>
            <p id="info-address" class="sub-address"></p>
            <p id="info-description"></p>
          </div>
          <div class="info-right">
            <div class="eui-label">PROJECT EUI</div>
            <div class="eui-value" id="info-eui"></div>
            <div class="eui-eui-line">
              <div class="eui-percent" id="info-percent"></div>
              <div class="eui-sentence" id="info-sentence"></div>
            </div>
            
          </div>
        </div>

        <div class="info-sections">
          <div class="info-column">
            <div class="section-header">
              <span class="section-title pink">Project Statistics</span>
              <button class="toggle-button" data-target="info-basic" onclick="toggleCollapse(this)">▼</button>
            </div>
            <div id="info-basic" class="content"></div>
          </div>
          <div class="info-column">
            <div class="section-header">
              <span class="section-title pink">AWARDS</span>
              <button class="toggle-button" data-target="info-awards" onclick="toggleCollapse(this)">▼</button>
            </div>
            <div id="info-awards" class="content"></div>
          </div>
          <div class="info-column">
            <div class="section-header">
              <span class="section-title pink">IN THE NEWS</span>
              <button class="toggle-button" data-target="info-news" onclick="toggleCollapse(this)">▼</button>
            </div>
            <div id="info-news" class="content"></div>
          </div>
          <div class="info-column">
            <div class="section-header">
              <span class="section-title pink">TEAM</span>
              <button class="toggle-button" data-target="info-team" onclick="toggleCollapse(this)">▼</button>
            </div>
            <div id="info-team" class="content"></div>
          </div>
        </div>


    </div>

    `;

    if (skipAnimation) {
      detailsContainer.style.display = 'block';
      mainContainer.style.display = 'none';
      header.style.display = 'none';
    } else {
      document.querySelector('.back-button').addEventListener('click', () => {
        window.location.href = 'project_index.html';
      });
    }

    loadPhotoTour(project.number);
    loadProjectOverlayData(project.number);

    // 监听滚动触发信息板浮现
    const overlay = document.getElementById('info-overlay');
    const container = document.getElementById('details-container');

    setupInfoOverlayScroll();

    const dataPath = `public/Photo/${project.number}/Data.json`;
    fetch(dataPath)
      .then(res => res.json())
      .then(data => {
        document.getElementById('info-name').innerText = data.ProjectName || '';
        document.getElementById('info-address').innerText = data.Address || '';
        document.getElementById('info-description').innerText = data.Description || '';
        document.getElementById('info-eui').innerText = data.EUI || '';
        document.getElementById('info-percent').innerText = data.Percent || '';
        document.getElementById('info-sentence').innerText = data.Sentence || '';
        
        document.getElementById('info-basic').innerHTML = `
          <div class="info-block">
            <div class="info-title">LOCATION</div>
            <div class="info-text">${data.Location}</div>
          </div>
          <div class="info-block">
            <div class="info-title">COMPLETED</div>
            <div class="info-text">${data.Completed}</div>
          </div>
          <div class="info-block">
            <div class="info-title">TOTAL SQUARE FOOTAGE</div>
            <div class="info-text">${data.TotalSquareFootage}</div>
          </div>
          <div class="info-block">
            <div class="info-title">PROGRAM COMPONENTS</div>
            <div class="info-text">${data.ProgramComponents}</div>
          </div>
          <div class="info-block">
            <div class="info-title">LEED STATUS</div>
            <div class="info-text">${data.LEEDStatus}</div>
          </div>
        `;
      
        
        document.getElementById('info-awards').innerHTML = data.Awards.map(item => `
          <div class="award-entry">
            <div class="award-year">${item.AwardsYear}</div>
            <div class="award-title"><span class="highlight">${item.Award}</span></div>
          </div>
        `).join('');
        
      
        document.getElementById('info-news').innerHTML = data.News.map(item => `
          <div class="news-entry">
            ${item.NewsLink?.trim()
              ? `<a href="${item.NewsLink}" target="_blank" class="highlight">${item.NewsTitle}</a>`
              : `<span>${item.NewsTitle}</span>`}
          </div>
        `).join('');
        
        
        document.getElementById('info-team').innerHTML = data.Team.map(member => `
          <div class="team-entry">
            <div class="team-name">
              ${member.PeopleLink?.trim()
                ? `<a href="${member.PeopleLink}" target="_blank" class="highlight">${member.TeamMember}</a>`
                : `<span>${member.TeamMember}</span>`}
            </div>
            <div class="team-role">${member.Position}</div>
          </div>
        `).join('');
        
            
        
      });

      document.querySelector('.left-nav')?.addEventListener('click', goToPrevPhoto);
      document.querySelector('.right-nav')?.addEventListener('click', goToNextPhoto);
      

  }

  async function loadProjectOverlayData(projectNumber) {
    const overlay = document.getElementById('info-overlay');
    try {
      const response = await fetch(`public/Photo/${projectNumber}/Data.json`);
      const data = await response.json();
  
      const newsItems = Array.isArray(data.NewsTitle)
        ? data.NewsTitle.map((title, i) => {
            const link = data.NewsLink?.[i];
            return link
              ? `<li><a href="${link}" target="_blank">${title}</a></li>`
              : `<li>${title}</li>`;
          }).join('')
        : '<li>No news data available</li>';
  
      const teamItems = Array.isArray(data.TeamMember)
        ? data.TeamMember.map((name, i) => {
            const link = data.PeopleLink?.[i];
            const role = data.Position?.[i];
            return `<li>${link ? `<a href='${link}' target='_blank'>${name}</a>` : name} - ${role || 'N/A'}</li>`;
          }).join('')
        : '<li>No team data available</li>';
  
      overlay.classList.remove('hidden');
  
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  }
  

  function generateCollapsibleSection(title, items, isHtml = false) {
    const content = isHtml ? `<ul>${items}</ul>` : `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    return `
      <div class="collapsible">
        <button class="toggle-button" onclick="toggleCollapse(this)">▼ ${title}</button>
        <div class="content">${content}</div>
      </div>
    `;
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

        // 始终使用 project_index.html 作为跳转页面
        const baseURL = 'project_index.html';
        const url = relatedID ? `${baseURL}?id=${currentID}&related=${relatedID}` : `${baseURL}?id=${currentID}`;

        // 显示详情页并更新 URL
        await displayProjectDetails(project);
        history.pushState({ projectId: project.number }, `Project ${project.number}`, url);
        detailsContainer.style.display = 'block';
        detailsContainer.scrollTo(0, 0);
        expandedImage.remove(); // 移除 expandedImage 元素
    });
  }

  async function loadProjectsData() {
    const data = await loadProjectInfoData();
    const projects = [];
  
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const info = data[key][0];
        const number = key.replace('Project', '');
        projects.push({
          number,
          name: info.ProjectName || '(No Title)',
          imageFolderPath: `public/Project/${number}`,
          relatedID: info.RelatedToolID || null,
        });
      }
    }
  
    return projects;
  }


  async function updateProjects(viewType = 'info') {
    const projects = await loadProjectsData();
    displayProjects(projects, viewType);
  }
  
  async function main() {

    const viewType = urlParams.get('view') || 'info';
    updateActiveButton(viewType);

    function updateActiveButton(viewType) {
      const buttons = ['info', 'awards', 'leed', 'map'];
      buttons.forEach(btn => {
        const element = document.getElementById(`${btn}-btn`);
        if (element) {
          element.style.color = (btn === viewType) ? '#db1a54' : '#333129'; 
        }
      });
    }

    
    const projects = await loadProjectsData();

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
      updateProjects(viewType);

    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', event => {
        const query = event.target.value.toLowerCase();
        const filteredProjects = projects.filter(project =>
          Object.values(project).some(value => value && value.toString().toLowerCase().includes(query))
        );
        displayProjects(filteredProjects, viewType);
      });
    }
    

    window.addEventListener('popstate', function(event) {
      if (event.state && event.state.projectId) {
        const project = projects.find(p => p.number.toString() === event.state.projectId);
        if (project) {
          displayProjectDetails(project, false); // 正常情况下展示详情页
        }
      } else {
        updateProjects(viewType);

        history.replaceState(null, null, 'index.html');
      }
    });

    hideLoadingOverlay();

  }

  main();

  