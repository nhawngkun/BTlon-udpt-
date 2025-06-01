const sampleBooks = [
  {
    "id": "123453249",
    "name": "Sách hoạt hình",
    "author": "Tác giả A",
    "lang": "Vietnamese",
    "category": "Science",
    "image": "https://link1.jpg",
    "title": "Sách khoa học",
    "link": "",
    "content": "Nội dung chi tiết sách.",
    "description": "Giới thiệu ngắn gọn về sách"
  },
  {
    "id": "17473851585112",
    "name": "Tắt Đèn",
    "author": "Tác giả A",
    "lang": "Vietnamese",
    "category": "literary",
    "image": "https://cdn1.fahasa.com/media/flashmagazine/images/page_images/tat_den_tai_ban_2022/2022_06_27_11_52_02_1-390x510.jpg",
    "title": "Tắt Đèn (Tái Bản) là một trong những tác phẩm văn học tiêu biểu nhất của nhà văn Ngô Tất Tố (tiểu thuyết, in trên báo Việt nữ năm 1937).",
    "link": "",
    "content": "Trăm năm trong cõi người ta,\nChữ tài chữ mệnh khéo là ghét nhau.\nTrải qua một cuộc bể dâu,\nNhững điều trông thấy mà đau đớn lòng.",
    "description": "Kiệt tác thơ lục bát Việt Nam"
  },
  {
    "id": "1ffcac2b-63fc-41d1-af51-58834e0ca732",
    "name": "Bông Cúc Trắng",
    "author": "Thi Thi",
    "lang": "Vietnamese",
    "category": "Cổ tích",
    "image": "blob:https://bookstoreudpt.vercel.app/a9efd69f-f0f1-4927-a523-997cbbbad9cc",
    "title": "a",
    "link": "",
    "content": "aa",
    "description": ""
  },
  {
    "id": "857e657a-f28f-4725-b7e4-7fe1813ec26e",
    "name": "Lão hạc",
    "author": "Tác giả B",
    "lang": "Vietnamese",
    "category": "literary",
    "image": "blob:https://bookstoreudpt.vercel.app/f8aba0bf-92b4-4f0b-9f8f-4987348427d7",
    "title": "a",
    "link": "",
    "content": "ac",
    "description": ""
  },
  {
    "id": "2bf82ee6-a88e-4b35-b129-8fd3fb2f6700",
    "name": "Tấm Cám",
    "author": "Thi Thi",
    "lang": "Vietnamese",
    "category": "Cổ tích",
    "image": "blob:https://bookstoreudpt.vercel.app/ee35dbe1-70b9-4def-b04c-7d73ecbfb511",
    "title": "b",
    "link": "",
    "content": "bb",
    "description": ""
  },
  {
    "id": "123456789",
    "name": "Thế Giới Atlantis",
    "author": "Tác giả A",
    "lang": "Vietnamese",
    "category": "Science",
    "image": "https://sachtiengviet.com/cdn/shop/products/456a739f8ba25abcc0df9f7948ea67c5.jpg?v=1701972138",
    "title": "Sách khoa học viễn tưởng cực hay",
    "link": "",
    "content": "Nội dung chi tiết sách...",
    "description": "Giới thiệu ngắn gọn về sách"
  },
  {
    "id": "94038c83-fcec-4125-958b-4a8b2bff0a9b",
    "name": "Sọ dừa",
    "author": "Thi Thi",
    "lang": "Vietnamese",
    "category": "Cổ tích",
    "image": "blob:https://bookstoreudpt.vercel.app/fda913e5-3d81-4818-9ae4-ea9aa9cc203f",
    "title": "12",
    "link": "",
    "content": "324",
    "description": ""
  },
  {
    "id": "123421945",
    "name": "Người Truyền Ký Ức",
    "author": "Tác giả C",
    "lang": "Vietnamese",
    "category": "Science",
    "image": "https://307a0e78.vws.vegacdn.vn/view/v2/image/img.media/nguoi-truyen-ky-uc.jpg",
    "title": "Những lời đề tựa giới thiệu ở cuốn sách cũng không thể nào giúp chúng ta cảm nhận được hết trí tưởng tượng và thông điệp của nó. ",
    "link": "",
    "content": "Nội dung chi tiết sách...",
    "description": "Giới thiệu ngắn gọn về sách"
  },
  {
    "id": "17473851585378994",
    "name": "Nhà Giả Kim",
    "author": "Tác giả C",
    "lang": "Vietnamese",
    "category": "Novel",
    "image": "https://phatphapungdung.com/sach-noi/wp-content/uploads/2019/10/Nha-gia-kim.jpg",
    "title": "Cuốn tiểu thuyết triết lý của Paulo Coelho về hành trình tìm kiếm vận mệnh",
    "link": "",
    "content": "Chàng chăn cừu Santiago từ Tây Ban Nha bắt đầu hành trình theo đuổi giấc mơ tìm kho báu và khám phá ra vận mệnh của chính mình. Anh học được Ngôn ngữ của Vũ trụ và sự khôn ngoan từ Nhà Giả Kim.",
    "description": "Tiểu thuyết về hành trình tìm kiếm vận mệnh cá nhân"
  },
  {
    "id": "17473851585425345",
    "name": "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
    "author": "Tác giả B",
    "lang": "Vietnamese",
    "category": "Novel",
    "image": "https://isach.info/images/story/cover/toi_thay_hoa_vang_tren_co_xanh__nguyen_nhat_anh.jpg",
    "title": "Tiểu thuyết của Nguyễn Nhật Ánh về tuổi thơ miền quê",
    "link": "",
    "content": "Tác phẩm kể về tuổi thơ yên bình, trong sáng và đầy cảm xúc của hai anh em ở một làng quê miền Trung. Những mâu thuẫn, ghen tị, yêu thương đều hòa quyện trong bối cảnh làng quê đầy chất thơ.",
    "description": "Tiểu thuyết về tuổi thơ miền quê Việt Nam"
  },
  {
    "id": "17473851585551421",
    "name": "Mã Mẫu Tử",
    "author": "Tác giả A",
    "lang": "Vietnamese",
    "category": "Science",
    "image": "https://bizweb.dktcdn.net/100/363/455/products/mamautu01e1696476247984.jpg?v=1710306252110",
    "title": "Tác phẩm khoa học phổ thông của Lê Minh Đức",
    "link": "",
    "content": "Tác phẩm giải thích những khái niệm vật lý và vũ trụ học như Big Bang, lỗ đen, không-thời gian, thuyết tương đối và thuyết lượng tử bằng ngôn ngữ phổ thông cho mọi người cùng tiếp cận.",
    "description": "Sách khoa học phổ thông về vũ trụ và thời gian"
  },
  {
    "id": "17473851585323404",
    "name": "Truyện Kiều",
    "author": "Tác giả C",
    "lang": "Vietnamese",
    "category": "literary",
    "image": "https://cdn1.fahasa.com/media/flashmagazine/images/page_images/truyen_kieu/2021_09_08_08_30_55_1-390x510.jpg",
    "title": "Tác phẩm thơ lục bát kinh điển của đại thi hào Nguyễn Du",
    "link": "",
    "content": "Trăm năm trong cõi người ta,\nChữ tài chữ mệnh khéo là ghét nhau.\nTrải qua một cuộc bể dâu,\nNhững điều trông thấy mà đau đớn lòng.",
    "description": "Kiệt tác thơ lục bát Việt Nam"
  },
  {
    "id": "1234523121234523126789",
    "name": "Sách hihii",
    "author": "Tác giả B",
    "lang": "Vietnamese",
    "category": "Science",
    "image": "https://link2.jpg",
    "title": "Sách khoa học thú vị",
    "link": "",
    "content": "Nội dung chi tiết sách.",
    "description": "Giới thiệu ngắn gọn về sách"
  },
  {
    "id": "17473851585171812",
    "name": "Dế Mèn Phiêu Lưu Ký",
    "author": "Tác giả C",
    "lang": "Vietnamese",
    "category": "Fiction",
    "image": "https://link3.jpg",
    "title": "Tác phẩm kinh điển của Tô Hoài",
    "link": "",
    "content": "Dế Mèn Phiêu Lưu Ký là tác phẩm nổi tiếng.",
    "description": "Giới thiệu ngắn gọn về sách"
  }
];

export default sampleBooks;
//