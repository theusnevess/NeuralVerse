import torch

x = torch.arange(25, dtype=torch.float32).reshape(1, 1, 5, 5)  # N,C,H,W
layer = torch.nn.Conv2d(1, 1, kernel_size=3, stride=1, padding=1, bias=False)
sobel_x = torch.tensor([[-1.,0.,1.],[-2.,0.,2.],[-1.,0.,1.]])
with torch.no_grad(): layer.weight.copy_(sobel_x.reshape(1, 1, 3, 3))
y = layer(x)  # Conv2d is cross-correlation; weight is (Cout,Cin,kh,kw), output is (1,1,5,5)
