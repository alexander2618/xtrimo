
import { PTCTemplate } from './types';

export const MOCK_ELISA_TEMPLATE: PTCTemplate = {
  id: 'elisa',
  title: 'ELISA 标准操作流程 (Sandwich Method)',
  description: '用于检测样品中特定蛋白质浓度的酶联免疫吸附测定标准流程。本方案经过优化，适用于高灵敏度细胞因子检测。该流程涵盖了从包被到显色终止的完整环节。',
  tags: ['ELISA', '蛋白质检测', '免疫学', 'DoE'],
  category: '免疫检测',
  date: '2024/03/20',
  version: 'IMM-V24.03',
  equipment: [
    { name: '酶标仪 (Plate Reader)', model: 'SpectraMax i3x', supplier: 'Molecular Devices' },
    { name: '多通道移液器', spec: '20-200uL', supplier: 'Rainin' },
    { name: '恒温孵育箱', spec: '37°C', supplier: 'Thermo Fisher' }
  ],
  reagents: [
    { name: '捕获抗体 (Capture Ab)', catNum: 'MAB-001-C', supplier: 'Abcam' },
    { name: '检测抗体 (Biotin-Detection Ab)', catNum: 'MAB-001-D', supplier: 'Abcam' },
    { name: 'HRP-Streptavidin', catNum: 'S2438', supplier: 'Sigma' },
    { name: 'TMB 显色液', catNum: 'TMB-S', supplier: 'Thermo' }
  ],
  blocks: [
    { id: 'h1', type: 'heading', content: '1. 板孔准备与包被 (Coating)' },
    { id: 'b1', type: 'instruction', content: '将捕获抗体用包被缓冲液 (PBS, pH 7.4) 稀释至 2 μg/mL。', params: { '浓度': '2 μg/mL', '缓冲液': 'PBS' } },
    { id: 'b2', type: 'instruction', content: '每孔加入 100 μL 稀释后的抗体，密封平板并在 4°C 下孵育过夜 (12-16小时)。', params: { '体积': '100 μL', '温度': '4°C' } },
    { id: 'h2', type: 'heading', content: '2. 封闭与洗涤 (Blocking & Washing)' },
    { id: 'b3', type: 'checklist', content: '弃去孔内液体，用洗涤液 (PBST) 洗涤 3 次，每次 300 μL。' },
    { id: 'b4', type: 'instruction', content: '每孔加入 200 μL 封闭液 (1% BSA/PBS)，室温孵育 1 小时。', params: { '时间': '1h', '封闭液': '1% BSA' } },
    { id: 'h3', type: 'heading', content: '3. 加样与标准品曲线 (Sampling)' },
    { id: 'b5', type: 'instruction', content: '按梯度稀释标准品 (1000, 500, 250, 125, 62.5, 31.25, 0 pg/mL)。', params: { '量程': '0-1000 pg/mL' } },
    { id: 'b6', type: 'instruction', content: '每孔加入 100 μL 样品或标准品，室温或 37°C 孵育 2 小时。', params: { '时间': '2h' } },
    { id: 'h4', type: 'heading', content: '4. 检测与显色 (Detection & Color Development)' },
    { id: 'b7', type: 'checklist', content: '洗涤 3 次后，每孔加入 100 μL 生物素标记检测抗体，孵育 1 小时。' },
    { id: 'b8', type: 'checklist', content: '加入 HRP-链霉亲和素 (1:2000 稀释)，避光孵育 30 分钟。' },
    { id: 'b9', type: 'instruction', content: '加入 100 μL TMB 显色液，避光显色 15-30 分钟，直到出现深蓝色。', params: { '时间': '15-30min' } },
    { id: 'b10', type: 'instruction', content: '每孔加入 50 μL 终止液 (2N H2SO4)，颜色由蓝色转为黄色。', params: { '终止液': '2N H2SO4' } },
    { id: 'h5', type: 'heading', content: '5. 数据读取 (Analysis)' },
    { id: 'b11', type: 'instruction', content: '在 30 分钟内使用酶标仪在 450 nm 处读取吸光度值。' }
  ]
};
