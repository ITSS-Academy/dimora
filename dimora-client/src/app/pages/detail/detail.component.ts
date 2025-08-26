import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  roomId: string | null = null;
  roomData: any;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.roomId = params['id'];
        console.log('Detail ID:', this.roomId);

        // Fake data (sau này thay bằng API)
        this.roomData = {
          title: 'Studio và bồn tắm trong rừng | Bếp riêng, Ban công',
          images: [
            'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/736f6de3-2004-4bab-b151-074c43995dd1.jpeg?im_w=720',
            'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/15ae967e-8a27-443b-ba92-ced0845546ae.jpeg?im_w=720',
            'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/148fc970-8569-42f2-a420-037b3c3a90e5.jpeg?im_w=720',
            'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/2da4fe38-3571-419e-95f3-3b279732f3a5.jpeg?im_w=720',
            'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/e86fe868-a312-477b-bc7b-86ce7617db82.jpeg?im_w=720'
          ],
          info: {
            subtitle: 'Toàn bộ căn hộ cho thuê tại Dalat, Việt Nam',
            desc: '2 khách · 1 phòng ngủ · 1 giường · 1 phòng tắm',
            price: 'Giá đã bao gồm mọi khoản phí'
          },
          host: {
            name: 'Baileys Ho',
            avatar: 'https://via.placeholder.com/50',
            subtext: 'Superhost · 11 tháng kinh nghiệm đón tiếp khách'
          },
          features: [
            {
              icon: 'fa-campground',
              title: 'Giải trí ngoài trời',
              subtext: 'Giường tắm nắng, ăn uống ngoài trời và khu vực BBQ thích hợp cho các chuyến đi mùa hè.'
            },
            {
              icon: 'fa-door-open',
              title: 'Tự nhận phòng',
              subtext: 'Tự nhận phòng bằng cách nhập mã số vào cửa.'
            },
            {
              icon: 'fa-calendar',
              title: 'Hủy miễn phí trước 18 thg 9',
              subtext: 'Được hoàn tiền đầy đủ nếu bạn thay đổi kế hoạch.'
            }
          ]
        };
      }
    });
  }
}
