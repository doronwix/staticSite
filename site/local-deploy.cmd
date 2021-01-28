echo call c:\progra~1\nodejs\npm.cmd install
echo if errorlevel 1 (  echo Failure Reason Given is ExitCode: %errorlevel%   )

call grunt local-deploy --force 

REM old name call grunt lessDeploy --force 

if errorlevel 1 (  echo Failure Reason Given is ExitCode: %errorlevel%  )

exit /b 0 