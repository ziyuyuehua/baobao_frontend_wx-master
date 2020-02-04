# -*-coding:utf-8-*-

import os
import shutil
import json

def compressJson():
    dir = 'D:\\python\\test替换'
    uDir = unicode(dir,'utf-8')
    files = listFiles(uDir)
    for file in files:
        if file.find('.json') > 0:
            print file
            fo = open(file,'r')
            fc = fo.read()
            print fc
            data = json.loads(fc)
            print data
            

def copySpine():
    #dir = 'D:\\python\\test中文'
    dir = 'D:\\cocos-creator\\moego_res\\人物动画'
    uDir = unicode(dir,'utf-8')
    #dir = dir.decode('utf-8')
    #dir = dir.encode('gbk')
    #print dir
    
    destDir = 'D:\\python\\test拷贝'
    uDestDir = unicode(destDir,'utf-8')
    
    files = listFiles(uDir)
    nameDict = {}
    for file in files:
        if file.find('.atlas') > 0:
            #print file
            fileStr = file.encode('utf-8')
            idx = fileStr.rfind('\\')
            #print idx
            suffixIdx = fileStr.rfind('.atlas')
            copyFileName = fileStr[idx+1:]
            #print 1, copyFileName
            
            copyDir = fileStr[idx+1:suffixIdx];
            #print 2, copyDir
            
            #copyFilePath = os.path.join(uDestDir, copyDir, copyFileName)
            #print 3, copyFilePath
            
            srcFileExceptSuffix = fileStr[:suffixIdx]
            #print 4, srcFileExceptSuffix

            fileDir = os.path.join(uDestDir, copyDir)
            #print 5, fileDir
            if not os.path.isdir(fileDir):
                os.makedirs(fileDir)

            if nameDict.has_key(copyDir):
                print 'repeated', copyDir, 'in', file, 'conflict', nameDict[copyDir]
                continue
            
            copyFiles(srcFileExceptSuffix, os.path.join(fileDir, copyDir))
            nameDict[copyDir] = file

def listFiles(rootdir):
    _files = []
    list = os.listdir(rootdir) #列出文件夹下所有的目录与文件
    for i in range(0,len(list)):
        path = os.path.join(rootdir,list[i])
        if os.path.isdir(path):
            _files.extend(listFiles(path))
        if os.path.isfile(path):
            _files.append(path)
            #print path
    return _files

def copyFiles(srcFileExceptSuffix, destFileExceptSuffix):
    #shutil.copyfile(unicode(fileStr,'utf-8'), copyFilePath)
    shutil.copyfile(unicode(srcFileExceptSuffix+'.atlas','utf-8'),
                    destFileExceptSuffix+'.atlas')
    shutil.copyfile(unicode(srcFileExceptSuffix+'.json','utf-8'),
                    destFileExceptSuffix+'.json')
    shutil.copyfile(unicode(srcFileExceptSuffix+'.png','utf-8'),
                    destFileExceptSuffix+'.png')

def walkDir():
    dir = 'D:\\python\\test中文'
    #dir = 'D:\\cocos-creator\\moego_res\\svn\\人物动画'
    uDir = unicode(dir,'utf-8')
    for item in os.walk(uDir):
        print item, '\n'

def checkHasSpine():
    #dir = 'D:\\python\\test中文'
    dir = 'D:\\cocos-creator\\moego_res\\svn\\人物动画'
    uDir = unicode(dir,'utf-8')

    dirs = []
    list = os.listdir(uDir) #列出文件夹下所有的目录与文件
    for i in range(0,len(list)):
        path = os.path.join(uDir, list[i])
        if os.path.isdir(path):
            dirs.append(path)
    #print dirs

    for dir in dirs:
        #print '\n', dir
        result = hasSpineInDir(dir)
        if not result:
            print 'not spine in ', dir

def hasSpineInDir(dir):
    result = False
    list = os.listdir(dir) #列出文件夹下所有的目录与文件
    for i in range(0,len(list)):
        path = os.path.join(dir, list[i])
        #print path
        if os.path.isdir(path):
            result |= hasSpineInDir(path)
        if os.path.isfile(path):
            if path.find('.atlas') > 0:
                return True
    return result

def renameHeader():
    dir = 'D:\\cocos-creator\\moego_res\\UI\\20190422\\头像'
    uDir = unicode(dir,'utf-8')

    list = os.listdir(uDir) #列出文件夹下所有的目录与文件
    for i in range(0,len(list)):
        path = os.path.join(uDir, list[i])
        if os.path.isfile(path):
            if path.endswith('.png') and path.find('staff_') < 0:
                fileStr = path.encode('utf-8')
                
                idx = fileStr.rfind('\\')
                dirName = fileStr[:idx]
                
                suffixIdx = fileStr.rfind('.png')
                fileName = fileStr[idx+1:]
                
                print dirName, fileName
                renamePath = os.path.join(dirName, 'staff_'+fileName)
                print 'rename', path, 'to', renamePath
                try:
                    os.rename(path, unicode(renamePath,'utf-8'))
                except Exception as e:
                    print e


if __name__ == '__main__':
    #walkDir()
    
    #checkHasSpine()
    copySpine()
    
    #compressJson()
    
    #renameHeader()
    
            
