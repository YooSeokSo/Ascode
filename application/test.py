import os
from timeit import default_timer as timer
from datetime import timedelta

start = timer()
for i in range(100):
   #os.system("curl -w %{http_code} http://localhost:8000/api/getWallet?walletid=1Q2W3E4R")
    os.system("curl -G http://localhost:8000/api/addCode -d url=title -d uploader=singer -d time=price -d country=country -d os=os -d walletid=walletid")
end = timer()
print(timedelta(seconds=end-start))

start = timer()
os.system("curl -G http://localhost:8000/api/addCode -d url=title -d uploader=singer -d time=price -d country=country -d os=os -d walletid=walletid")
end = timer()
print(timedelta(seconds=end-start))