// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "home",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-code",
          title: "code",
          description: "A selection of repositories I have worked on.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/code/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "A detailed CV is provided upon request.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-i-am-starting-my-masters-in-artificial-intelligence-at-the-university-of-amsterdam",
          title: 'I am starting my Masters in Artificial Intelligence at the University of Amsterdam....',
          description: "",
          section: "News",},{id: "news-our-reproducibility-study-of-data-driven-methods-for-balancing-fairness-and-efficiency-in-ride-pooling-got-accepted-at-the-ml-reproducibility-challenge-2021",
          title: 'Our reproducibility study of “Data-Driven Methods for Balancing Fairness and Efficiency in Ride-Pooling”...',
          description: "",
          section: "News",},{id: "news-i-am-starting-my-master-s-thesis-on-self-supervised-visual-counting-under-the-joint-supervision-of-yuki-m-asano-and-tengda-han",
          title: 'I am starting my Master’s thesis on self-supervised visual counting under the joint...',
          description: "",
          section: "News",},{id: "news-i-am-going-to-be-a-teaching-assistant-for-the-natural-language-processing-course-in-the-master-s-programme-in-artificial-intelligence",
          title: 'I am going to be a teaching assistant for the Natural Language Processing...',
          description: "",
          section: "News",},{id: "news-i-have-been-admitted-to-the-ellis-msc-honours-programme",
          title: 'I have been admitted to the ELLIS MSc Honours Programme.',
          description: "",
          section: "News",},{id: "news-i-am-visiting-tengda-han-at-the-visual-geometry-group-of-the-university-of-oxford",
          title: 'I am visiting Tengda Han at the Visual Geometry Group of the University...',
          description: "",
          section: "News",},{id: "news-our-paper-geometric-superpixel-representations-for-efficient-image-classification-with-graph-neural-networks-has-been-accepted-at-the-4th-visual-inductive-priors-for-data-efficient-deep-learning-workshop-at-iccv2023",
          title: 'Our paper “Geometric Superpixel Representations for Efficient Image Classification with Graph Neural Networks”...',
          description: "",
          section: "News",},{id: "news-i-graduated-with-distinction-from-the-msc-artificial-intelligence-programme-at-the-university-of-amsterdam",
          title: 'I graduated with distinction from the MSc Artificial Intelligence programme at the University...',
          description: "",
          section: "News",},{id: "news-i-joined-tno-s-intelligent-imaging-group-as-a-machine-learning-scientist",
          title: 'I joined TNO’s Intelligent Imaging group as a Machine Learning Scientist.',
          description: "",
          section: "News",},{id: "news-our-paper-learning-to-count-without-annotations-has-been-accepted-at-cvpr2024",
          title: 'Our paper “Learning to Count without Annotations” has been accepted at CVPR2024!',
          description: "",
          section: "News",},{id: "news-i-ve-started-as-a-phd-candidate-in-the-fundamental-ai-lab-at-the-university-of-technology-nuremberg-supervised-by-yuki-asano",
          title: 'I’ve started as a PhD candidate in the Fundamental AI Lab at the...',
          description: "",
          section: "News",},{id: "news-i-ve-been-admitted-to-the-ellis-phd-program-jointly-supervised-by-yuki-asano-university-of-technology-nuremberg-germany-and-andrew-zisserman-university-of-oxford-uk",
          title: 'I’ve been admitted to the ELLIS PhD program, jointly supervised by Yuki Asano...',
          description: "",
          section: "News",},{id: "news-our-paper-franca-nested-matryoshka-clustering-for-scalable-visual-representation-learning-has-been-accepted-at-cvpr2026",
          title: 'Our paper “Franca: Nested Matryoshka Clustering for Scalable Visual Representation Learning” has been...',
          description: "",
          section: "News",},{id: "news-together-with-the-fundamental-ai-lab-i-spent-10-days-in-japan-visiting-research-groups-as-part-of-the-jst-aspire-program-in-tokyo-i-presented-my-ongoing-work-at-the-aspire-workshop-and-research-discussions-at-institutes-including-aist-sakana-ai-and-sony-ai",
          title: 'Together with the Fundamental AI Lab, I spent 10 days in Japan visiting...',
          description: "",
          section: "News",},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6C%75%6B%61%73%6B%6E%62%6C@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=egwx6IMAAAAJ", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/lukasknobel", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/lukas-knobel", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
